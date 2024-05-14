from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import tiktoken
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

TEMPERATURE = 0.9

MAX_TOKEN_LIMIT = 3500

CHUNK_SIZE = 12000

CHUNK_SIZE_QUARKLE = 400

TEXT_TOO_LONG = "Sorry, Quarkle is not able to critique larger chapters at the moment."

CHUNK_LIMIT = 1

MODEL_NAME = "gpt-3.5-turbo"


def token_counter(text):
    tokenizer = tiktoken.get_encoding("cl100k_base")
    tokens = tokenizer.encode(text, disallowed_special=())
    return len(tokens)


def chunk_text(large_text: str) -> List[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=10,
        length_function=token_counter,
        separators=["\n\n", "\n", " ", ""],
    )

    chunks = text_splitter.split_text(large_text)

    return chunks


def chunk_text_size(large_text: str, chunk_size) -> List[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=10,
        length_function=token_counter,
        separators=["\n\n", "\n", " ", ""],
    )

    chunks = text_splitter.split_text(large_text)

    return chunks


def chunk_text_quarkle(large_text: str) -> List[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE_QUARKLE,
        chunk_overlap=0,
        length_function=token_counter,
        separators=["\n\n", "\n", " ", ""],
    )

    chunks = text_splitter.split_text(large_text)

    return chunks


def chunk_text_quarkle_with_chapter_metadata(
    large_text: str, chapter_number: int, chapter_name: str
) -> List[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE_QUARKLE,
        chunk_overlap=0,
        length_function=token_counter,
        separators=["\n\n", "\n", " ", ""],
    )

    chunks = text_splitter.split_text(large_text)

    return [
        {"text": chunk, "chapter_number": chapter_number, "chapter_name": chapter_name}
        for chunk in chunks
    ]
