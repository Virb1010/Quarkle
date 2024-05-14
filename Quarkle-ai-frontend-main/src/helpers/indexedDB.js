const DB_NAME = "StudioDB";
const DB_VERSION = 1;
const STORE_NAME = "books";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject("IndexedDB error: " + event.target.errorCode);
    };
  });
}

export async function deleteDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = function () {
      resolve();
    };

    request.onerror = function (event) {
      reject("IndexedDB error: " + event.target.errorCode);
    };

    request.onblocked = function () {
      reject("Delete operation blocked due to open connections");
    };
  });
}

export async function saveBooksToIndexedDb(books) {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const promises = books.map((book) => {
    return new Promise((resolve, reject) => {
      const request = store.put(book);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
  });

  return Promise.all(promises)
    .then((results) => {
      return results;
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      db.close(); // Close the connection
    });
}

export async function getBooksFromIndexedDB() {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export async function updateChapterInIndexedDb(chaptersToUpdate, bookIdToUpdate) {
  if (bookIdToUpdate === undefined || bookIdToUpdate === null || bookIdToUpdate === 0) {
    return;
  }

  if (chaptersToUpdate.length === 0) {
    return;
  }

  if (chaptersToUpdate[0].bookId !== bookIdToUpdate) {
    return;
  }

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  transaction.oncomplete = () => db.close(); // Set the transaction complete event before starting the operation

  return new Promise((resolve, reject) => {
    const request = store.get(bookIdToUpdate);
    request.onsuccess = function () {
      const data = request.result;
      if (!data) {
        reject(new Error("No book found with the specified bookId"));
        return;
      }
      // Replace the chapters with the new data
      data.chapters = chaptersToUpdate;
      // Update the time_updated field with the current timestamp
      data.time_updated = new Date().toISOString();

      const updateRequest = store.put(data);
      updateRequest.onsuccess = () => resolve(updateRequest.result);
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    request.onerror = () => reject(request.error);
  }).finally(() => {
    db.close(); // Close the connection
  });
}

export async function createBookInIndexedDb(book) {
  if (!book || !book.id) {
    // throw new Error("Invalid book object provided.");
    return;
  }

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.add(book);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => {
    db.close(); // Close the connection
  });
}

export async function getSingleBookFromIndexedDB(bookId) {
  if (bookId === undefined || bookId === null) {
    // throw new Error("Invalid book ID provided.");
    return;
  }

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(bookId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => {
    db.close(); // Close the connection
  });
}

export async function deleteBookFromIndexedDb(bookId) {
  if (bookId === undefined || bookId === null) {
    // throw new Error("Invalid book ID provided.");
    return;
  }

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(bookId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => {
    db.close(); // Close the connection
  });
}

export async function updateBookTitleInIndexedDb(newTitle, bookId) {
  if (bookId === undefined || bookId === null) {
    return;
    // throw new Error("Invalid book ID provided.");
  }
  if (!newTitle) {
    return;
    // throw new Error("Invalid title provided.");
  }

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(bookId);
    request.onsuccess = function () {
      const data = request.result;
      if (!data) {
        reject(new Error("No book found with the specified bookId"));
        return;
      }
      // Update the title with the new data
      data.title = newTitle;
      // Update the time_updated field with the current timestamp
      data.time_updated = new Date().toISOString();

      const updateRequest = store.put(data);
      updateRequest.onsuccess = () => resolve(updateRequest.result);
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    request.onerror = () => reject(request.error);
  }).finally(() => {
    db.close(); // Close the connection
  });
}

export async function deleteChapterFromIndexedDb(chapterId) {
  if (chapterId === undefined || chapterId === null) {
    return;
    // throw new Error("Invalid chapter ID provided.");
  }

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const cursorRequest = store.openCursor();

  return new Promise((resolve, reject) => {
    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const book = cursor.value;
        const chapterIndex = book.chapters.findIndex((chapter) => chapter.id === chapterId);
        if (chapterIndex !== -1) {
          book.chapters.splice(chapterIndex, 1);
          book.time_updated = new Date().toISOString();
          const updateRequest = cursor.update(book);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
          updateRequest.onerror = () => reject(updateRequest.error);
          return;
        }
        cursor.continue();
      } else {
        reject(new Error("No chapter found with the specified chapterId"));
      }
    };
    cursorRequest.onerror = () => reject(cursorRequest.error);
  }).finally(() => {
    db.close(); // Close the connection
  });
}
