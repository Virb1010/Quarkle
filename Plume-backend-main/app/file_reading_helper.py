import re
import logging
from bs4 import BeautifulSoup
from collections import defaultdict, Counter
import fitz
from werkzeug.utils import secure_filename
from flask import abort

from config import db
from models import Chapters, chapter_schema, Books, Users

MINIMUM_WORDS_PER_CHAPTER = 400
MAX_CHAPTER_TITLE_CHARS = 120

import markdown
from bs4 import BeautifulSoup


def process_single_file(binary_doc, book_id, chapter_number):
    text_output, file_extension = extract_text(binary_doc)
    chapters = []
    chapter_data = None
    if file_extension == "pdf":
        chapter_data = parse_chapters_from_pdf(text_output)
    elif file_extension == "md":
        chapter_data = parse_chapters_from_md_html(text_output)

    if not chapter_data:
        chapter_data = {f"Chapter {chapter_number}": text_output}

    for key, value in chapter_data.items():
        chapter = {
            "title": key,
            "content": value,
            "book_id": book_id,
            "chapter_number": chapter_number,
        }
        chapter_number += 1
        new_chapter = chapter_schema.load(chapter, session=db.session)
        db.session.add(new_chapter)
        db.session.flush()
        chapters.append(new_chapter)

    return chapters


def process_multi_file(binary_doc, book_id, chapter_number):
    chapter_title = binary_doc.filename.rsplit(".", 1)[0]
    text_output, _ = extract_text(binary_doc)

    chapter = {
        "title": chapter_title,
        "content": text_output,
        "book_id": book_id,
        "chapter_number": chapter_number,
    }
    new_chapter = chapter_schema.load(chapter, session=db.session)
    db.session.add(new_chapter)
    db.session.flush()

    return new_chapter


# Helper functions


def extract_text(binary_doc):
    filename = secure_filename(binary_doc.filename)
    file_extension = filename.rsplit(".", 1)[1].lower()
    if file_extension == "pdf":
        text_output = extract_text_from_pdf(binary_doc)
        text_output = clean_up_pdf(text_output)
    elif file_extension == "md":
        text_output = extract_text_from_md(binary_doc)
    else:
        abort(400, "Unsupported file type")

    return text_output, file_extension


def extract_text_from_md(binary_doc):
    # Read the Markdown file content
    md_content = binary_doc.read().decode("utf-8")
    # Convert Markdown to HTML
    html_content = markdown.markdown(md_content)
    return html_content


def extract_text_from_pdf(binary_doc):
    doc = fitz.open(stream=binary_doc.read(), filetype="pdf")
    text_output = ""
    for page in doc:
        text = page.get_text("html")
        text_output += text
    return text_output


def clean_up_pdf(text):
    soup = BeautifulSoup(text, "html.parser")
    top_values = []
    most_frequent_top = None

    # Extract all "top" values from the style attribute of <p> tags. These show the vertical position of the text
    for p_tag in soup.find_all("p"):
        style = p_tag.get("style", "")
        top_search = re.search(r"top:\s*(\d+\.?\d*)pt", style)
        if top_search:
            top_values.append(float(top_search.group(1)))

    # Only 1 line of text in the PDF
    if len(top_values) == 1:
        top_values = [0] + top_values

    # calculate difference between top values to find the spacing between lines
    top_values = [int(j - i) for i, j in zip(top_values[:-1], top_values[1:])]

    # Find the most frequent top value. This is the regular space between lines. Any greater than this is a new paragraph
    if top_values:
        most_frequent_top = Counter(top_values).most_common(1)[0][0]

    # Process paragraphs and insert NEWPARAGRAPH where a new paragraph is detected
    if most_frequent_top:
        previous_top_value = 0
        for p_tag in soup.find_all("p"):
            style = p_tag.get("style", "")
            top_search = re.search(r"top:\s*(\d+\.?\d*)pt", style)
            if top_search:
                current_top_value = float(top_search.group(1))
                # If the current top value is greater than the most frequent top value, mark a new paragraph
                if int(current_top_value - previous_top_value) > most_frequent_top:
                    p_tag.insert_before("NEWPARAGRAPH")
                previous_top_value = current_top_value

    # Unwrap all tags except <b>
    for tag in soup.find_all(True):
        if tag.name != "b":
            tag.unwrap()

    cleaned_text = str(soup)
    cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()
    cleaned_text = cleaned_text.replace("NEWPARAGRAPH", "<br><br>")
    return cleaned_text


def parse_chapters_from_md_html(text):
    sections = defaultdict(str)
    current_section = "Introduction"

    # Regular expression to identify HTML heading (<h1> or <h2>) tags
    section_pattern = re.compile(r"<(h2|h1)>(.*?)</(h2|h1)>", re.IGNORECASE)

    # Find all matches and their positions
    matches = [
        (match.start(), match.end(), match.group(2))
        for match in section_pattern.finditer(text)
    ]

    if not matches:
        # If no matches, the entire text is one section
        return {current_section: text.strip()}

    last_pos = 0
    for start_pos, end_pos, title in matches:
        # Extract the text for the previous section, excluding the title
        section_text = text[last_pos:start_pos].strip()
        if section_text:
            sections[current_section] = section_text

        title_text = BeautifulSoup(title, "html.parser").get_text().strip()
        # Trim the title if it's longer than 120 characters
        trimmed_title = title_text[:MAX_CHAPTER_TITLE_CHARS]

        # Add a suffix if the title already exists
        suffix = 2
        unique_title = trimmed_title
        while unique_title in sections:
            unique_title = f"{trimmed_title}-{suffix}"
            suffix += 1

        current_section = unique_title
        last_pos = end_pos  # Update to start after the current title

    # Add the last section
    sections[current_section] = text[last_pos:].strip()

    return dict(sections)


def parse_chapters_from_pdf(text):
    # Function to merge consecutive <b> tags separated by <br> tags or spaces
    def merge_bold_tags(match):
        # Extracting all <b>...</b> segments from the match
        segments = re.findall(r"<b>(.*?)</b>", match.group(0))
        # Join these segments, separating them with spaces
        merged = " ".join(segment.strip() for segment in segments)
        return f"<b>{merged}</b>"

    # Apply the merging function to each occurrence of consecutive <b> tags
    text = re.sub(
        r"((<b>.*?</b>)(\s*<br>\s*|\s)*)+", merge_bold_tags, text, flags=re.DOTALL
    )

    # Extract the merged bold text into a list
    bold_text = [match.group(1) for match in re.finditer(r"<b>(.*?)</b>", text)]

    # Identify the text following the bolded text
    following_text = re.findall(r"</b>\s*(.*?)(?=<b>|$)", text, re.DOTALL)
    following_text = [
        re.sub(r"^(<br>)+|(<br>)+$", "", x.strip()) for x in following_text if x.strip()
    ]

    # Create a dictionary of chapter titles and content
    d = defaultdict()
    previous_key = None

    # Check for text before the first bold text and add it as "Introduction"
    intro_text = re.search(r"^(.*?)(?=<b>)", text, re.DOTALL)

    if intro_text and intro_text.group().strip() != "<br><br>":
        d["Introduction"] = re.sub(r"^(<br>)+|(<br>)+$", "", intro_text.group())

    for key, value in zip(bold_text, following_text):
        word_count = len(value.split())
        # If chapter length is less than 100 words, collapse into previous chapter
        if word_count < MINIMUM_WORDS_PER_CHAPTER and previous_key is not None:
            d[previous_key] += "<br><br><b>" + key + "</b><br>" + value
        else:
            # Check if the key already exists, append a suffix if it does
            key = key[:MAX_CHAPTER_TITLE_CHARS]  # Limit the key to 120 characters
            original_key = key
            suffix = 2
            while key in d:
                key = f"{original_key}-{suffix}"
                suffix += 1
            d[key] = value
            previous_key = key

    return d
