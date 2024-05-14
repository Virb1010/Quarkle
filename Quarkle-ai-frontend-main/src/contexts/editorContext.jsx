"use client";
// context for the full app consisting of Answer, Chunks

import { createContext, useContext, useReducer } from "react";

const EditorContext = createContext();

const initialState = {
  title: "",
  bookId: 0,
  books: [],
  chapterId: 0,
  chapters: [],
  subscription: {
    subscription_type: "basic",
    is_active: true,
  },
  isLightMode: true,
  openExpressionAllowed: false,
  openExpressionEnabled: false,
  isCategoryLoading: false,
  category: "",
  editor: null,
  isStudioLoading: false,
  isStudioLoadingError: false,
  isStudioReady: false,
  isEditorReady: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "books/set":
      return { ...state, books: action.payload };
    case "title/set":
      return { ...state, title: action.payload };
    case "bookId/set":
      return { ...state, bookId: action.payload };
    case "bookId/reset":
      return { ...state, bookId: null };
    case "subscription/set":
      return { ...state, subscription: action.payload };
    case "category/set":
      return { ...state, category: action.payload };
    case "chapterId/set":
      return { ...state, chapterId: action.payload };
    case "chapters/set":
      return { ...state, chapters: action.payload };
    case "chapters/update":
      var updatedChapters = state.chapters.map((chapter) => {
        if (chapter.id === state.chapterId) {
          chapter.content = action.payload;
        }
        return chapter;
      });
      return { ...state, chapters: updatedChapters };
    case "chapters/addMany":
      return { ...state, chapters: [...state.chapters, ...action.payload] };
    case "chapters/delete": {
      const updatedChapters = state.chapters.filter((chapter) => chapter.id !== action.payload);
      return { ...state, chapters: updatedChapters };
    }
    case "chapters/updateTitle":
      return {
        ...state,
        chapters: state.chapters.map((chapter) =>
          chapter.id === action.payload.chapterId ? { ...chapter, title: action.payload.newTitle } : chapter,
        ),
      };
    case "lightMode/set":
      return { ...state, isLightMode: action.payload };
    case "category/loading/set":
      return { ...state, isCategoryLoading: action.payload };
    case "openExpressionAllowed/set":
      return { ...state, openExpressionAllowed: action.payload };
    case "openExpressionEnabled/set":
      return { ...state, openExpressionEnabled: action.payload };

    case "studio/loading/set":
      return { ...state, isStudioLoading: action.payload };
    case "studio/error/set":
      return { ...state, isStudioLoadingError: action.payload };
    case "studio/ready/set":
      return { ...state, isStudioReady: action.payload };

    case "editor/set":
      return { ...state, editor: action.payload };
    case "editor/insertContent":
      state.editor.commands.insertContent(action.payload);
      return state;
    case "editor/reset":
      state.editor.commands.clearContent(true);
      return state;
    case "editor/refresh":
      return { ...state, title: "", bookId: 0, chapterId: 0, chapters: [], isEditorReady: false };
    case "editor/ready/set":
      return { ...state, isEditorReady: action.payload };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export function EditorContextProvider({ children }) {
  const [
    {
      title,
      books,
      bookId,
      chapterId,
      chapters,
      category,
      subscription,
      isLightMode,
      openExpressionAllowed,
      openExpressionEnabled,
      isCategoryLoading,
      isStudioLoading,
      isStudioLoadingError,
      isStudioReady,
      isEditorReady,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  return (
    <EditorContext.Provider
      value={{
        title,
        bookId,
        books,
        chapterId,
        chapters,
        category,
        subscription,
        isLightMode,
        openExpressionAllowed,
        openExpressionEnabled,
        isCategoryLoading,
        isStudioLoading,
        isStudioLoadingError,
        isStudioReady,
        isEditorReady,
        dispatch,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
}
