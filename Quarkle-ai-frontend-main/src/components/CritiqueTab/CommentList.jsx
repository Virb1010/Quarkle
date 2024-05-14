import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import mixpanel from "mixpanel-browser";
import { Tooltip } from "react-tooltip";

import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { resolveComment, thumbsUp, thumbsDown } from "@/src/helpers/dbFunctions";

import { useAiService } from "@/src/contexts/aiContext";
import { useEditorContext } from "@/src/contexts/editorContext";

import StopStreamingButton from "@/src/components/Buttons/StopStreamingButton";

import WritingIcon from "@/src/components/Icons/WritingIcon";
import AcceptIcon from "@/src/components/Icons/AcceptIcon";
import RejectIcon from "@/src/components/Icons/RejectIcon";

export function CommentList({
  editor,
  activeCommentId,
  comments,
  setComments,
  implementedComments,
  saveData,
  setOpen,
  setActiveCommentId,
}) {
  const [selectedThumbs, setSelectedThumbs] = useState([]);
  const [isCurrentlyStreaming, setIsCurrentlyStreaming] = useState(null); // commentId

  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isLightMode, bookId, chapterId, chapters, openExpressionEnabled } = useEditorContext();
  const { AiCommentImplementationService } = useAiService();

  // Unset Comment Mark. Resolve in Db. Remove from state.
  function resolveCommentAndUnsetMark(commentId) {
    editor.commands.unsetComment(commentId);
    setComments(comments.filter((c) => c.id !== commentId));
    resolveComment({ getAccessTokenSilently, commentId, plumeAPI });
  }

  function getCommentedText(commentId) {
    const elements = document.querySelectorAll(`.my-comment[data-comment-id="${commentId}"]`);
    let commentedText = "";
    elements.forEach((element, index) => {
      commentedText += element.textContent;
    });
    return commentedText;
  }

  // Get AI Comment Implementation
  function getQuarkleCommentImplementation(comment) {
    saveData(chapters).catch(console.error);

    const commentedText = getCommentedText(comment.id);
    // Packaging in the format of "commentedText // comment.content"
    const commentImplementationPackage = `${commentedText} // ${comment.content}`;

    if (isAuthenticated) {
      AiCommentImplementationService.start(
        getAccessTokenSilently,
        bookId,
        chapterId,
        chapters,
        commentImplementationPackage,
        editor,
        saveData,
        comment.id,
        openExpressionEnabled,
        setIsCurrentlyStreaming,
      );
    } else {
      setOpen((o) => !o);
    }
  }

  // Accept the comment implementation by deleting mark. Resolve comment in Db.
  // Remove comment from state. Remove comment from implementedComments.
  function acceptCommentImplementation(editor, comment, resolveCommentAndUnsetMark) {
    mixpanel.track("AI Comment Implementation Accepted");
    editor.commands.acceptCommentImplementation(comment.id);
    resolveCommentAndUnsetMark(comment.id);
  }
  // Reject the comment implementation by deleting mark. Remove comment from implementedComments.
  function rejectCommentImplementation(editor, comment) {
    mixpanel.track("AI Comment Implementation Rejected");
    editor.commands.rejectCommentImplementation(comment.id);
  }

  const handleThumbsUpClick = async (id) => {
    mixpanel.track("AI Comments Thumbs Up Clicked");
    const strippedId = id.replace("comment", "");

    setSelectedThumbs((prev) => {
      const oppositeThumbIndex = prev.findIndex((thumb) => thumb.id === id && thumb.type === "down");
      if (oppositeThumbIndex !== -1) {
        prev.splice(oppositeThumbIndex, 1);
      }
      thumbsUp({ getAccessTokenSilently, strippedId, plumeAPI });
      return [...prev, { id, type: "up" }];
    });
  };

  const handleThumbsDownClick = async (id) => {
    mixpanel.track("AI Comments Thumbs Down Clicked");
    const strippedId = id.replace("comment", "");
    setSelectedThumbs((prev) => {
      const oppositeThumbIndex = prev.findIndex((thumb) => thumb.id === id && thumb.type === "up");
      if (oppositeThumbIndex !== -1) {
        prev.splice(oppositeThumbIndex, 1);
      }
      thumbsDown({ getAccessTokenSilently, strippedId, plumeAPI });
      return [...prev, { id, type: "down" }];
    });
  };

  return (
    <>
      {comments.length === 0 && <span className="text-empty"></span>}
      {comments.length > 0 &&
        comments.map((comment) => (
          <div
            key={comment.id}
            className={`comment-component ${comment.id == activeCommentId ? "active" : ""} ${isLightMode ? "light" : ""}`}
            onClick={() => {
              setActiveCommentId(comment.id);
            }}
          >
            <div className="Top-Bar-Comment">
              <span className="span-class">
                <a className="Comment-Title">{comment.critique}</a>
              </span>
              <a data-tooltip-id="resolve-tooltip" data-tooltip-content="Resolve this comment">
                <i
                  className="pi pi-check mr-1 font-bold dark:text-white"
                  onClick={() => {
                    resolveCommentAndUnsetMark(comment.id);
                  }}
                ></i>
              </a>
              <Tooltip id="resolve-tooltip" />
            </div>
            <div
              contentEditable={comment.id === activeCommentId}
              className="Comment-input-text"
              id={comment.id}
              onBlur={(event) => {
                const value = event.target.textContent;
                setComments(
                  comments.map((comment) => {
                    if (comment.id === activeCommentId) {
                      return {
                        ...comment,
                        content: value,
                      };
                    }
                    return comment;
                  }),
                );
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                setActiveCommentId(null);
              }}
            >
              {comment.content || ""}
            </div>
            <div className="Bottom-Bar-Comment">
              <div className="Thumbs-up-down">
                <Tooltip id="thumbs-up-tooltip"></Tooltip>
                <a data-tooltip-id="thumbs-up-tooltip" data-tooltip-content="I like this edit!">
                  <i
                    className={`pi ${
                      selectedThumbs.find((thumb) => thumb.id === comment.id && thumb.type === "up") ? "pi-thumbs-up-fill" : "pi-thumbs-up"
                    }`}
                    style={{ fontSize: "0.9rem" }}
                    onClick={() => handleThumbsUpClick(comment.id)}
                  />
                </a>
                <Tooltip id="thumbs-down-tooltip"></Tooltip>
                <a data-tooltip-id="thumbs-down-tooltip" data-tooltip-content="I don't like this edit">
                  <i
                    className={`pi ${
                      selectedThumbs.find((thumb) => thumb.id === comment.id && thumb.type === "down")
                        ? "pi-thumbs-down-fill"
                        : "pi-thumbs-down"
                    }`}
                    style={{ fontSize: "0.9rem" }}
                    onClick={() => handleThumbsDownClick(comment.id)}
                  />
                </a>
              </div>
              {!implementedComments.includes(comment.id) && (
                <>
                  {isCurrentlyStreaming !== comment.id ? (
                    <div
                      className={`Comment-Action-Button ${isLightMode ? "light" : ""}`}
                      data-tooltip-id="comment-implement-tooltip"
                      data-tooltip-content="Implement this comment"
                      onClick={() => getQuarkleCommentImplementation(comment)}
                    >
                      <WritingIcon size={18} className={`action-icon ${isLightMode ? "light" : ""}`} />
                      <p className={`action-button-text ${isLightMode ? "light" : ""}`}>Implement</p>
                      <Tooltip id="comment-implement-tooltip" />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <StopStreamingButton
                        isLightMode={isLightMode}
                        onClick={() => AiCommentImplementationService.closeConnection([bookId, chapterId, comment.id])}
                        tooltipContent={"Stop Streaming this Comment"}
                      />
                    </div>
                  )}
                </>
              )}

              {implementedComments.includes(comment.id) && (
                <div className="Accept-Reject-Buttons">
                  <Tooltip id="comment-accept-tooltip" />
                  <div
                    className={`Comment-Action-Button ${isLightMode ? "light" : ""}`}
                    data-tooltip-id="comment-accept-tooltip"
                    data-tooltip-content="Accept the suggested changes"
                    onClick={() => acceptCommentImplementation(editor, comment, resolveCommentAndUnsetMark)}
                  >
                    <AcceptIcon size={18} className={`action-icon ${isLightMode ? "light" : ""}`} />
                  </div>

                  <Tooltip id="comment-reject-tooltip" />
                  <div
                    className={`Comment-Action-Button ${isLightMode ? "light" : ""}`}
                    data-tooltip-id="comment-reject-tooltip"
                    data-tooltip-content="Reject the suggested changes"
                    onClick={() => rejectCommentImplementation(editor, comment)}
                  >
                    <RejectIcon size={18} className={`action-icon ${isLightMode ? "light" : ""}`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
    </>
  );
}
