import json
import re
from AI.AI_helper import chunk_text_quarkle_with_chapter_metadata, token_counter
from .prompt import (
    quarkle_prompt_builder,
    quarkle_pro_upgrade_request_prompt,
)
from models import (
    Books,
    Conversations,
    conversation_schema,
    Chapters,
    Chats,
    chat_schema,
)
from config import db
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
import re
from service import StreamOpenAI
import logging
from concurrent.futures import ThreadPoolExecutor
from priomptipy import (
    render,
    UserMessage,
    SystemMessage,
    AssistantMessage,
    Scope,
    Isolate,
)
from openai import AsyncOpenAI
import numpy as np

client = AsyncOpenAI()


logger = logging.getLogger(__name__)

embeddings = OpenAIEmbeddings()


DEFAULT_TEXT = """<p><strong>Highlight a piece of text </strong>and click a button on top to let Quarkle work their magic:</p><p><br><br>Try this example: <strong>The mysterious gladiator masked in a golden bull\'s helmet is the fiercest warrior known</strong></p>"""


def add_chapter_context_to_quarkle_messages(
    book_id,
    user_input,
):
    chapters = Chapters.query.filter(Chapters.book_id == book_id).all()

    book_chunked_with_metadata = [
        chunk_text_quarkle_with_chapter_metadata(
            clean_text(chapter.content),
            chapter_number=chapter.chapter_number,
            chapter_name=chapter.title,
        )
        for chapter in chapters
    ]

    # Flatten the list of lists into a single list of chunks with metadata
    book_chunked_with_metadata = [
        chunk
        for chapter_chunks in book_chunked_with_metadata
        for chunk in chapter_chunks
    ]

    VECTOR_DB_CHUNKS_CONTEXT = dynamically_determine_k_length(
        len(book_chunked_with_metadata)
    )

    if len(book_chunked_with_metadata) == 0:
        return []

    text_list = [chunk["text"] for chunk in book_chunked_with_metadata]
    metadata = [
        {
            "chapter_number": chunk["chapter_number"],
            "chapter_name": chunk["chapter_name"],
        }
        for chunk in book_chunked_with_metadata
    ]
    vectorDb = FAISS.from_texts(
        text_list,
        OpenAIEmbeddings(),
        metadatas=metadata,
    )

    relevant_context = vectorDb.similarity_search(
        user_input, k=VECTOR_DB_CHUNKS_CONTEXT
    )
    context_messages = UserMessage(children=["## Potentially Helpful Context:"])

    for i, context in enumerate(relevant_context):
        chapter_number = context.metadata.get("chapter_number")
        chapter_name = context.metadata.get("chapter_name")
        chapter_excerpt = context.page_content
        chapter_context_message = Scope(
            f" \n Sample from Chapter {chapter_number} - {chapter_name}: {chapter_excerpt}",
            relative_priority=-i,
        )

        context_messages.children.append(chapter_context_message)

    context_messages_limited = Isolate(children=[context_messages], token_limit=5000)

    return [context_messages_limited]


def add_chat_context_to_quarkle_messages(conversation_id, max_convos=3):
    decay_factor = 0.5
    # fetch from db and add to quarkle_messages
    chats = (
        Chats.query.filter(Chats.conversation_id == conversation_id)
        .order_by(Chats.id)
        .all()
    )

    final_message_tokens = token_counter(chats[-1].message)
    token_limit = max(5000, final_message_tokens + 100)
    chat_messages_history = Isolate(token_limit=token_limit, children=[])

    priority = 0
    # Process chats in pairs and concatenate messages
    for i in range(max(0, len(chats) - 7), len(chats), 2):
        # Check if there is a pair to process (user and assistant)
        if i + 1 < len(chats):
            combined_message = [
                UserMessage(chats[i].message),
                AssistantMessage(chats[i + 1].message),
            ]
            chat_messages_history.children.append(
                Scope(
                    combined_message, relative_priority=-4 + priority
                )  # Later messages have higher priority
            )
        else:
            # The last message will be a user message. Add it to the list
            chat_messages_history.children.append(UserMessage(chats[i].message))
            break
        priority += 1

    # Limit the chat_messages_history to the last three scopes and the user message
    chat_messages_history.children = chat_messages_history.children[-4:]

    # If there are more than 7 chats, create a vector database from the chat messages
    if len(chats) > 7:
        text_list = []
        combined_messages = []
        for i in range(0, len(chats) - 8, 2):
            # Combine user and assistant messages into pairs
            combined_message = [chats[i].message, chats[i + 1].message]
            combined_messages.append(combined_message)
            text_list.append(json.dumps(combined_message))

        vectorDb = FAISS.from_texts(
            text_list,
            embeddings,
        )

        # Prepare the query embeddings from the latest 7 chats
        with ThreadPoolExecutor() as executor:
            query_embeddings = list(
                executor.map(
                    embeddings.embed_query, [chat.message for chat in chats[-7:]]
                )
            )

        # Create a list of weights that decay according to the decay factor
        weights = np.array([decay_factor**i for i in range(len(query_embeddings))])[
            ::-1
        ]
        # Normalize the weights so they sum up to 1
        weights = weights / np.sum(weights)
        # Reshape weights to have the same number of dimensions as query_embeddings
        weights = weights[:, np.newaxis]

        # Multiply the embeddings by the weights
        weighted_embeddings = np.multiply(query_embeddings, weights)

        # Average the weighted embeddings
        average_embedding = np.mean(weighted_embeddings, axis=0)

        # Now you can use average_embedding in your similarity search
        relevant_context = vectorDb.similarity_search_by_vector(
            average_embedding, k=max_convos
        )

        # Add the relevant conversation pairs fetched from the vector database to chat_messages_history

        for i, context in enumerate(relevant_context):
            relevant_message_pair = json.loads(context.page_content)
            user_msg = UserMessage(relevant_message_pair[0])
            assistant_msg = AssistantMessage(relevant_message_pair[1])
            chat_messages_history.children.insert(
                0,
                Scope([user_msg, assistant_msg], relative_priority=-5 - i),
            )

    logger.info(f"chat_messages_history: {chat_messages_history}")
    return [chat_messages_history]


def summarize_comment_list(comment_list, user_input):
    comment_messages = UserMessage(
        [
            f"## Question: {user_input}",
            f"""Here are the comments that I was provided for my question. Summarize them to give a high level overview of the comments.""",
        ]
    )
    for i, comment in enumerate(comment_list):
        comment_messages.children.append(
            Scope(
                children=f"\n Comment {i+1} - {json.dumps(comment)}",
                relative_priority=-len(comment_list) + i,
            )
        )
    return [comment_messages]


async def is_content_explicit(user_input):
    response = await client.moderations.create(input=user_input)

    output = response.results[0]
    categories = output.categories
    category_scores = output.category_scores

    # Convert the category_scores and categories objects to dictionaries
    category_scores_dict = vars(category_scores)
    categories_dict = vars(categories)

    # Get the category with the highest probability
    highest_category = max(category_scores_dict, key=category_scores_dict.get)

    # Check if any category is flagged as true
    any_category_true = any(categories_dict.values())

    return any_category_true, highest_category


async def handle_explicit_question(websocket):
    messages = [
        {
            "role": "system",
            "content": quarkle_pro_upgrade_request_prompt,
        },
    ]
    tokens_used, response_str = await StreamOpenAI(
        messages, websocket, use_pro_model=False, use_open_expression_model=False
    )
    return ""


async def brainstorm(
    user_input,
    book_id,
    conversation_id,
    existing_user,
    tokens_used_input,
    tokens_used_output,
    comment_list=[],
    use_message_history=True,
    user_asking_about_pro_subscription=False,
    use_book_context=True,
    use_pro_model=False,
    use_open_expression_model=False,
    websocket=None,
):
    ALLOWED_SENSITIVE_CATEGORY_IN_BASIC = ["violence", "harassment"]
    # Use regex to find the blockquote and associated text
    blockquote_pattern = re.compile(r">(.*?)\n")
    user_input_without_blockquote = blockquote_pattern.sub("", user_input)

    is_user_question_explicit, highest_category = await is_content_explicit(user_input)
    if is_user_question_explicit:
        logger.info(f"Explicit content detected: {highest_category} ")

    if (
        is_user_question_explicit
        and highest_category not in ALLOWED_SENSITIVE_CATEGORY_IN_BASIC
        and not use_pro_model
    ):
        await handle_explicit_question(websocket)
        return ""

    if is_user_question_explicit:
        use_open_expression_model = True

    conversation_id = create_title(
        conversation_id, book_id, user_input_without_blockquote
    )

    book = Books.query.filter(Books.id == book_id).one_or_none()
    title = book.title
    category = book.category

    new_chat = chat_schema.load(
        {
            "message": user_input,
            "conversation_id": conversation_id,
            "book_id": book_id,
            "is_user": True,
        },
        session=db.session,
    )

    db.session.add(new_chat)

    system_messages = [
        SystemMessage(
            quarkle_prompt_builder(
                title=title,
                subscription_type="Pro" if use_pro_model else "Basic",
                user_query=user_input,
                category=category,
                user_asking_about_pro_subscription=user_asking_about_pro_subscription,
            )
        )
    ]

    context_messages = []
    chat_messages = []
    comment_messages = []

    # Add chapter context to quarkle_messages
    if use_book_context:
        context_messages = add_chapter_context_to_quarkle_messages(
            book_id,
            user_input,
        )

    # Add chat context to quarkle_messages
    if use_message_history:
        chat_messages = add_chat_context_to_quarkle_messages(conversation_id)

    # Add comment context to quarkle_messages
    if len(comment_list) > 0:
        comment_messages = summarize_comment_list(comment_list, user_input)

    quarkle_messages = (
        system_messages + context_messages + chat_messages + comment_messages
    )

    render_options = {"token_limit": 15000, "tokenizer": "cl100k_base"}
    prompt = await render(quarkle_messages, render_options)
    messages = prompt.get("prompt").get("messages")

    # Check if user's messages are explicit and if so, use the open expression model
    is_message_body_explicit, _ = await is_content_explicit(json.dumps(messages))
    if is_message_body_explicit:
        logger.info("Explicit content detected. Using open expression model.")
        use_open_expression_model = True

    tokens_used_output, quarkle_reply = await StreamOpenAI(
        messages, websocket, use_pro_model, use_open_expression_model
    )

    new_chat = chat_schema.load(
        {
            "message": quarkle_reply,
            "conversation_id": conversation_id,
            "book_id": book_id,
            "is_user": False,
        },
        session=db.session,
    )
    db.session.add(new_chat)

    # also update the conversation.updated_at with the current time
    conversation = Conversations.query.filter(
        Conversations.id == conversation_id
    ).one_or_none()
    conversation.updated_at = db.func.utc_timestamp()

    existing_user.tokens_used_today = (
        existing_user.tokens_used_today + tokens_used_input + tokens_used_output
    )
    db.session.commit()
    return ""


def dynamically_determine_k_length(chunks):
    if chunks <= 5:
        return 3
    elif chunks <= 10:
        return 4
    elif chunks <= 15:
        return 5
    return 7


def clean_text(text):
    remove_intro = text.replace(DEFAULT_TEXT, "")
    clean = re.compile("<.*?>")
    return re.sub(clean, "", remove_intro)


def create_title(conversation_id, book_id, user_input):
    title = user_input[:250]  # Trim the title to 250 characters
    ongoing_conversation = Conversations.query.filter(
        Conversations.id == conversation_id
    ).one_or_none()

    if ongoing_conversation is None:
        ongoing_conversation = conversation_schema.load(
            {"title": title, "book_id": book_id, "archived": False},
            session=db.session,
        )
        db.session.add(ongoing_conversation)
        db.session.commit()
        # Use the ongoing conversation id as the foreign key

    if (
        ongoing_conversation.title == "New Conversation"
        or ongoing_conversation.title == ""
    ):
        ongoing_conversation.title = title
        db.session.commit()

    return ongoing_conversation.id
