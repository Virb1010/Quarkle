export class Chapter {
  constructor({ chapter }) {
    this.bookId = chapter["book_id"];
    this.chapterNumber = chapter["chapter_number"];
    this.content = chapter["content"];
    this.createdAt = chapter["created_at"];
    this.id = chapter["id"];
    this.title = chapter["title"];
  }
}

export class Book {
  constructor({ book }) {
    this.id = book["id"];
    this.time_posted = book["time_posted"];
    this.time_updated = book["time_updated"];
    this.title = book["title"];
    this.chapters = book["chapters"].map((chapter) => new Chapter({ chapter }));
  }
}

export function convertToBookObject(data) {
  return data["books"].map((book) => new Book({ book }));
}

export function convertToChapterObject(data) {
  return new Chapter({ chapter: data });
}
