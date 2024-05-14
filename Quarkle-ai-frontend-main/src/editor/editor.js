"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import { useAuth0 } from "@auth0/auth0-react";

import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Details from "@tiptap-pro/extension-details";
import DetailsSummary from "@tiptap-pro/extension-details-summary";
import DetailsContent from "@tiptap-pro/extension-details-content";
import Placeholder from "@tiptap/extension-placeholder";
import SpanMark from "@/src/editor/SpanMark";
import Comment from "@/src/editor/Comment";
import CommentImplementation from "@/src/editor/CommentImplementation";

import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { useEditorContext } from "@/src/contexts/editorContext";
import { readBookCategory } from "@/src/helpers/dbFunctions";
import { updateChapterInIndexedDb } from "@/src/helpers/indexedDB";

function wordCounter(editor) {
  let text;
  let words = [];
  if (editor) {
    text = editor.getText();
    words = text.split(/\s+/).filter(function (word) {
      return word.length > 0;
    });
  }
  return words.length;
}

export function useQuarkleEditor({
  displayContent,
  questionSuggested,
  setActiveCommentId,
  focusCommentWithActiveId,
  switchToCommentTab,
  setIsSaving,
  debouncedSaveData,
  setWordCount,
  getQuarkleRecommendedQuestions,
  getQuarkleCategoryDetection,
}) {
  const { chapterId, chapters, category, bookId, dispatch } = useEditorContext();
  const categoryRef = useRef(category);

  const { getAccessTokenSilently } = useAuth0();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      SpanMark,
      Comment.configure({
        HTMLAttributes: {
          class: "my-comment",
        },
        onCommentActivated: (commentId) => {
          setActiveCommentId(commentId);
          if (commentId) setTimeout(() => focusCommentWithActiveId(commentId));
        },
        switchToCommentTab: switchToCommentTab,
      }),
      CommentImplementation.configure({
        HTMLAttributes: {
          class: "comment-implementation",
        },
        onCommentActivated: (commentId) => {
          setActiveCommentId(commentId);
          if (commentId) setTimeout(() => focusCommentWithActiveId(commentId));
        },
        switchToCommentTab: switchToCommentTab,
      }),
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: "details",
        },
      }),
      DetailsSummary,
      DetailsContent,
      Placeholder.configure({
        placeholder: "Write something or ask Quarkle for ideas...",
      }),
    ],
    content: displayContent !== undefined ? displayContent : "",
    onBlur: ({ editor }) => {},
    onCreate: ({ editor }) => {},
    onFocus: ({ editor }) => {
      setWordCount(wordCounter(editor));
    },
    onUpdate: ({ editor }) => {
      dispatch({ type: "chapters/update", payload: editor.getHTML() });
      setWordCount(wordCounter(editor));
      setIsSaving(true);
    },
  });

  useEffect(() => {
    if (editor) {
      dispatch({ type: "editor/set", payload: editor });
    }
  }, [editor]);

  useEffect(() => {
    return async () => {
      debouncedSaveData(chapters);
    };
  }, [chapters]);

  useEffect(() => {
    if (bookId) {
      updateChapterInIndexedDb(chapters, bookId);
    }
  }, [bookId, chapters]);

  useEffect(() => {
    setWordCount(wordCounter(editor));
  }, [editor, chapters, chapterId, bookId]);

  useEffect(() => {
    const text = editor?.getText();
    if (text?.length >= 350 && questionSuggested.current === false) {
      if (Math.random() < 0.1) {
        questionSuggested.current = true;
        getQuarkleRecommendedQuestions(chapters, bookId);
      }
    }
  }, [editor, chapters, bookId]);

  useEffect(() => {
    const text = editor?.getText();
    if (text?.length >= 350 && categoryRef.current === "" && chapterId !== 0 && bookId !== 0) {
      getQuarkleCategoryDetection(chapters, chapterId, bookId);
    }
  }, [chapters, editor, bookId, chapterId, categoryRef]);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    if (bookId !== 0) {
      readBookCategory({ getAccessTokenSilently, bookId, plumeAPI, dispatch });
    }
  }, [bookId, category]);

  return editor;
}
