import { useCallback, useEffect, useState } from "react";
import { debounce, delay } from "@/src/helpers/utils";
import { getMultipleComments } from "@/src/helpers/dbFunctions";

// Hook to highlight the active comment
export function useHighlightActiveComment(activeCommentId) {
  useEffect(() => {
    // Focus the comment with the active comment id
    if (!activeCommentId) return;

    const elements = document.querySelectorAll(`.my-comment[data-comment-id="${activeCommentId}"]`);

    // Function to highlight and scroll to the comment
    const highlightAndScroll = async () => {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.classList.add("active");
        if (i === 0) element.scrollIntoView({ behavior: "smooth", block: "center" });
        await delay(100 * (i + 1));
      }
    };

    // Run the async function
    highlightAndScroll();

    // Cleanup function to remove the 'active' class
    return () => {
      elements.forEach((element, index) => {
        delay(100 * (index + 1)).then(() => element.classList.remove("active"));
      });
    };
  }, [activeCommentId]);

  return null;
}

// Hook to detect and set implemented comments
export function useDetectImplementedComments(editorHtml, implementedComments, setImplementedComments) {
  // Effect to detect implemented comments
  useEffect(() => {
    // Function to extract comment IDs from the HTML content
    const extractCommentIds = () => {
      const elements = document.querySelectorAll(`.comment-implementation`);
      const comment_id_list = Array.from(elements).map((el) => el.getAttribute("data-implementation-id"));
      // get unique
      return [...new Set(comment_id_list)];
    };

    // Set the implemented comment IDs
    const implementedCommentIds = extractCommentIds(editorHtml);
    if (implementedCommentIds.length - implementedComments.length === 0) {
      return;
    }
    setImplementedComments(implementedCommentIds);
  }, [editorHtml, setImplementedComments]);

  return null; // This hook does not render anything
}

// Hook to detect and set comments
export async function useDetectComments(editorHtml, comments, setComments, getAccessTokenSilently) {
  // Define the debounced function
  const debouncedHandleCommentsMismatch = useCallback(
    debounce((comments, extractedCommentIds, setComments, getAccessTokenSilently) => {
      handleCommentsMismatch(comments, extractedCommentIds, setComments, getAccessTokenSilently);
    }, 500),
    [],
  );

  // Effect to detect implemented comments
  useEffect(() => {
    // Function to extract comment IDs from the HTML content
    const extractCommentIds = (html) => {
      const elements = document.querySelectorAll(`.my-comment`);
      const comment_id_list = Array.from(elements).map((el) => el.getAttribute("data-comment-id"));
      // get unique
      return [...new Set(comment_id_list)];
    };

    // Define the async function
    const checkAndAddComments = () => {
      const extractedCommentIds = extractCommentIds(editorHtml);
      debouncedHandleCommentsMismatch(comments, extractedCommentIds, setComments, getAccessTokenSilently);
    };
    // Call the async function
    checkAndAddComments();
  }, [editorHtml]);
}

const restructureRawComments = (comment) => {
  return {
    id: `comment${comment.id}`,
    content: comment["message"],
    critique: comment["title"], // add this line
    replies: [],
    createdAt: new Date(),
  };
};

async function handleCommentsMismatch(comments, extractedCommentIds, setComments, getAccessTokenSilently) {
  // Extract just the ids from the comments array
  const commentIds = comments.filter(Boolean).map((comment) => comment.id);

  // Convert both arrays to Sets for easier comparison
  const commentIdsSet = new Set(commentIds);
  const extractedCommentIdsSet = new Set(extractedCommentIds);

  // Find missing and extra comments by checking the difference between the sets
  const extraCommentIds = [...commentIdsSet].filter((id) => !extractedCommentIdsSet.has(id));
  const getCommentIds = [...extractedCommentIdsSet].filter((id) => !commentIdsSet.has(id));

  if (extraCommentIds.length > 0) {
    extraCommentIds.forEach((commentId) => {
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    });
  }

  if (getCommentIds.length > 0) {
    getCommentIds.forEach((id, index) => {
      getCommentIds[index] = id.replace("comment", "");
    });

    const rawDbComments = await getMultipleComments({ getAccessTokenSilently, getCommentIds });
    rawDbComments.forEach((comment) => {
      const newComment = restructureRawComments(comment);
      setComments((prevComments) => {
        const commentExists = prevComments.some((prevComment) => prevComment.id === newComment.id);
        const updatedComments = commentExists ? prevComments : [...prevComments, newComment];
        return updatedComments.sort((a, b) => a.id.localeCompare(b.id));
      });
    });
  }
}
