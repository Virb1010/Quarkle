import { debounce } from "@/src/helpers/utils";
import { plumeAPI } from "@/src/helpers/ServiceHelper";
import {
  updateChapterInIndexedDb,
  createBookInIndexedDb,
  deleteChapterFromIndexedDb,
  getBooksFromIndexedDB,
  saveBooksToIndexedDb,
  getSingleBookFromIndexedDB,
} from "@/src/helpers/indexedDB";
import { Book, Chapter, convertToChapterObject } from "@/src/models/BooksModel.js";
import { convertToBookObject } from "@/src/models/BooksModel.js";
import axiosRetry from "axios-retry";

export function getMultipleComments({ getAccessTokenSilently, getCommentIds }) {
  return getAccessTokenSilently().then((token) => {
    const queryString = `ids=${getCommentIds.join(",")}`;
    const urlWithParams = `critique_api/comments?${queryString}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    return plumeAPI
      .get(urlWithParams, config)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Error fetching comments: ${response.statusText}`);
        }
        return response.data; // Assuming the API returns the list of comments in response.data
      })
      .catch((error) => {
        console.error("Error fetching multiple comments:", error);
        throw error; // Rethrow the error for further handling
      });
  });
}

export function resolveComment({ getAccessTokenSilently, commentId, plumeAPI }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI
      .put(`critique_api/comments/resolve/${commentId.replace("comment", "")}`, {}, config)
      .then(function (response) {
        // console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

export function getChat({ getAccessTokenSilently, bookId, setChats, plumeAPI, setConversations, setIsChatLoading, setActiveConversation }) {
  if (bookId) {
    getAccessTokenSilently().then((token) => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      plumeAPI
        .get("/critique_api/chats/" + bookId, config)
        .then(function (response) {
          setIsChatLoading(false);
          const conversations = response["data"];
          setConversations(conversations);
          setActiveConversation(conversations[0] && conversations[0]["conversation_id"] ? conversations[0]["conversation_id"] : null);
        })
        .catch(function (error) {
          setIsChatLoading(false);
          // console.log(error);
        });
    });
  }
}

export function activateConversation({ getAccessTokenSilently, conversation_id, setActiveConversation, plumeAPI }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    plumeAPI
      .put("/critique_api/chats/activate/" + conversation_id, {}, config)
      .then(function (response) {
        setActiveConversation(conversation_id);
      })
      .catch(function (error) {
        // console.log(error);
      });
  });
}

export function startNewConversation({ getAccessTokenSilently, bookId, plumeAPI, setConversations, setActiveConversation }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI
      .post("/critique_api/chats/" + bookId, {}, config)
      .then((r) => {
        setConversations((prevConversations) => [
          ...prevConversations,
          {
            conversation_id: r["data"]["conversation_id"],
            title: "New Conversation",
            created_at: r["data"]["created_at"],
            updated_at: r["data"]["updated_at"],
            book_id: bookId,
            chats: [],
          },
        ]),
          setActiveConversation(r["data"]["conversation_id"]);
      })
      .catch((e) => {
        // console.log(e);
      });
  });
}

export function deleteChats({ getAccessTokenSilently, bookId, plumeAPI }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI.delete("/critique_api/chats/" + bookId, config).then((r) => {});
  });
}

export function createBook({ getAccessTokenSilently, bookId, title, editor, plumeAPI, setIsSaving, dispatch }) {
  if (editor === undefined || editor === null) {
    return Promise.resolve("Not Saved");
  }
  if (bookId === 0) {
    getAccessTokenSilently().then((token) => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      setIsSaving(true);
      plumeAPI
        .post(
          "/books_api/books",
          {
            title: title.length === 0 ? "Untitled Draft" : title,
          },
          config,
        )
        .then(function (response) {
          dispatch({ type: "bookId/set", payload: response.data["book"]["id"] });
          dispatch({ type: "chapterId/set", payload: response.data["chapter"]["id"] });
          dispatch({ type: "chapters/set", payload: [response.data["chapter"]] });
          setIsSaving(false);

          let currentDate = new Date().toISOString();

          let chapterData = {
            book_id: response.data["book"]["id"],
            chapter_number: 1,
            content: "",
            created_at: currentDate,
            id: response.data["chapter"]["id"],
            title: "Chapter 1",
          };

          let bookData = {
            id: response.data["book"]["id"],
            time_posted: currentDate,
            time_updated: currentDate,
            title: "Untitled Draft",
            chapters: [chapterData], // Pass an array of objects, not an array of Chapter objects
          };

          let newBook = new Book({ book: bookData });

          createBookInIndexedDb(newBook);
        })
        .catch(function (error) {
          setIsSaving(false);
          // console.log(error);
        });
    });
  }
  return Promise.resolve("Saved");
}

export function saveChapters({ getAccessTokenSilently, chapters, setLastSave, plumeAPI, setIsSaving, bookId }) {
  const transformedChapters = chapters.map((chapter) => ({
    chapter_id: chapter.id,
    content: chapter.content,
    title: chapter.title,
  }));
  return getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    setIsSaving(true);

    plumeAPI
      .put(`/books_api/chapters/update_all`, transformedChapters, config)
      .then(function (response) {
        setLastSave(new Date().getTime());
        setIsSaving(false);
      })
      .catch(function (error) {
        setIsSaving(false);
        // Optionally handle the error for the API request here
      });
  });
}

export function addChapter({ getAccessTokenSilently, bookId, plumeAPI, dispatch, chapters }) {
  return getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI
      .post("/books_api/books/" + bookId + "/chapters", {}, config)
      .then(function (response) {
        var updatedChapters = [...chapters, convertToChapterObject(response.data)];
        dispatch({ type: "chapters/set", payload: updatedChapters });
        updateChapterInIndexedDb(updatedChapters, bookId);
        return response["data"];
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

function regularPutTitle({ getAccessTokenSilently, bookId, body, plumeAPI, dispatch }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI
      .put("/books_api/books/" + bookId, body, config)
      .then(function (response) {
        dispatch({ type: "bookId/set", payload: response.data["id"] });
      })
      .catch(function (error) {});
  });
}

export const putTitle = debounce(regularPutTitle, 1000);

export function thumbsUp({ getAccessTokenSilently, strippedId, plumeAPI }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI.patch("/critique_api/comments/thumbsup/" + strippedId, {}, config).then((res) => {});
  });
}

export function thumbsDown({ getAccessTokenSilently, strippedId, plumeAPI }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI.patch("/critique_api/comments/thumbsdown/" + strippedId, {}, config).then((res) => {});
  });
}

export function deleteChapters({ getAccessTokenSilently, chapterId, plumeAPI }) {
  deleteChapterFromIndexedDb(chapterId);
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    plumeAPI.delete("/books_api/chapters/" + chapterId, config).then((res) => {});
  });
}

function regularUpdateChapterTitle({ getAccessTokenSilently, chapterId, title, plumeAPI }) {
  getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const body = {
      title: title,
    };
    plumeAPI
      .patch("/books_api/chapters/" + chapterId, body, config)
      .then(function (response) {
        // Handle the response here
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

export const updateChapterTitle = debounce(regularUpdateChapterTitle, 1000);

export function setUserAcceptedTerms({ getAccessTokenSilently, plumeAPI }) {
  return getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    return plumeAPI
      .put("/users_api/users/accepted_terms", {}, config)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  });
}

export function getUserAcceptedTerms({ getAccessTokenSilently, plumeAPI }) {
  return getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    return plumeAPI
      .get("/users_api/users/accepted_terms", config)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  });
}

export function fetchBooksDataFromDb({ getAccessTokenSilently, isAuthenticated, plumeAPI, setAllowRedirect, dispatch }) {
  if (isAuthenticated) {
    dispatch({ type: "studio/loading/set", payload: true });
    dispatch({ type: "studio/ready/set", payload: false });

    // Get the current reload count from local storage, or set it to 0 if it doesn't exist
    let reloadCount = parseInt(localStorage.getItem("reloadCount") || "0");
    let timeoutDuration = 20000 + reloadCount * 10000; // Starting from 20 seconds

    // Create a timeout promise with the updated timeout duration
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, timeoutDuration);
    });

    // Wrap the original fetch logic in a promise
    const fetchPromise = new Promise((resolve, reject) => {
      getAccessTokenSilently().then((token) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: timeoutDuration,
        };
        axiosRetry(plumeAPI, { retries: 3 });

        getBooksFromIndexedDB()
          .then((booksFromDB) => {
            if (booksFromDB.length > 0) {
              booksFromDB
                .sort((model1, model2) => {
                  const date1 = new Date(model1.time_updated);
                  const date2 = new Date(model2.time_updated);
                  return date1 - date2;
                })
                .reverse();
              resolve(booksFromDB);
            } else {
              plumeAPI
                .get("/users_api/users/fetch_one", config)
                .then((response) => {
                  document.querySelector(".loading-gif")?.classList.add("explode");
                  dispatch({ type: "studio/error/set", payload: false });
                  var book_models = convertToBookObject(response["data"]);

                  book_models
                    .sort((model1, model2) => {
                      const date1 = new Date(model1.time_updated);
                      const date2 = new Date(model2.time_updated);
                      return date1 - date2;
                    })
                    .reverse();

                  saveBooksToIndexedDb(book_models)
                    .then(() => {})
                    .catch((error) => {});

                  resolve(book_models);
                })
                .catch((error) => {
                  dispatch({ type: "studio/loading/set", payload: false });
                  console.error("Could not retrieve books from Backend", error);
                  reject(error); // Reject the promise on error
                });
            }
          })
          .catch((error) => {
            console.error("Could not retrieve books from IndexedDB", error);
            reject(error); // Reject the promise on error
          });
      });
    });

    // Use Promise.race to handle whichever promise settles first
    Promise.race([fetchPromise, timeoutPromise])
      .then((booksFromDb) => {
        if (booksFromDb) {
          dispatch({ type: "books/set", payload: booksFromDb });
          dispatch({ type: "studio/loading/set", payload: false });
          dispatch({ type: "studio/ready/set", payload: true });
          setAllowRedirect(true);
        } else {
          throw new Error("Request timed out");
        }
      })
      .catch((error) => {
        console.error("Fetch failed or timed out", error);
        dispatch({ type: "studio/loading/set", payload: false });
        dispatch({ type: "studio/error/set", payload: true });
        localStorage.setItem("reloadCount", (reloadCount + 1).toString());
        window.location.reload();
      });
  } else {
    dispatch({ type: "studio/loading/set", payload: false });
  }
}

export async function fetchSingleBookDataFromDb({ isAuthenticated, bookId, setOpenInvalidBookPopup, dispatch }) {
  if (isAuthenticated) {
    dispatch({ type: "editor/ready/set", payload: false });
    return getSingleBookFromIndexedDB(bookId)
      .then((bookFromDB) => {
        if (bookFromDB) {
          dispatch({ type: "bookId/set", payload: bookFromDB.id });
          dispatch({ type: "chapters/set", payload: bookFromDB.chapters });
          dispatch({ type: "title/set", payload: bookFromDB.title });
          dispatch({ type: "chapterId/set", payload: bookFromDB.chapters[0].id });
          dispatch({ type: "editor/ready/set", payload: true });
        } else {
          setOpenInvalidBookPopup(true);
        }
      })
      .catch((error) => {
        console.error("Could not retrieve book from IndexedDB", error);
      });
  } else {
  }
}

export function readBookCategory({ getAccessTokenSilently, bookId, plumeAPI, dispatch }) {
  return getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    return plumeAPI
      .get(`/books_api/books/${bookId}/category`, config)
      .then((response) => {
        dispatch({ type: "category/set", payload: response["data"] });
        return response;
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  });
}

export function updateBookCategory({ getAccessTokenSilently, bookId, newCategory, plumeAPI }) {
  return getAccessTokenSilently().then((token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const body = {
      new_category: newCategory,
    };

    return plumeAPI
      .patch(`/books_api/books/${bookId}/category`, body, config)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  });
}

// export function updateUserProfile({ getAccessTokenSilently, plumeAPI, userAge, userProfession }) {
//   // send put request to users api with body = {age: age, profession: profession}
//   console.log("updateUserProfile");

//   getAccessTokenSilently().then((token) => {
//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     };
//     const body = {
//       profile: { age: userAge, profession: userProfession },
//     };
//     plumeAPI
//       .put("/users_api/users/edit_profile", body, config)
//       .then((res) => {
//         console.log(res);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
// }

// export async function getUserProfile({ getAccessTokenSilently, plumeAPI }) {
//   console.log("getUserProfile");

//   try {
//     const token = await getAccessTokenSilently();
//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const res = await plumeAPI.get("/users_api/users/fetch_one", config);
//     console.log(res);
//     return res.data.profile; // Assuming the profile data is located in res.data.profile
//   } catch (err) {
//     console.log(err);
//     // Handle the error appropriately - you might also want to return or throw it
//     throw err;
//   }
// }
