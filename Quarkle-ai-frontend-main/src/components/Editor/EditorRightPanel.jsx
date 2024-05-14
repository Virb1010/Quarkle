"use client";

import "primeicons/primeicons.css";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Tooltip } from "react-tooltip";

import { getChat } from "@/src/helpers/dbFunctions";
import { plumeAPI } from "@/src/helpers/ServiceHelper";

import { useEditorContext } from "@/src/contexts/editorContext";
import { useDetectComments, useDetectImplementedComments, useHighlightActiveComment } from "@/src/hooks/commentHooks";
import { useLoadingProgress } from "@/src/hooks/loadingHooks";

import CritiqueTab from "@/src/components/CritiqueTab/CritiqueTab";
import BrainstormTab from "@/src/components/BrainstormTab/BrainstormTab";
import MinimizeButton from "@/src/components/Buttons/MinimizeButton";

const commentimg = "/images/comment.png";
const brainstormImg = "/images/brainstorm.png";

function EditorRightPanel({
  editor,
  isRightPanelVisible,
  activeCommentId,
  setOpen,
  selectedTab,
  switchToCommentTab,
  setSelectedTab,
  questionSuggested,
  recommendedQuestions,
  setRecommendedQuestions,
  setRightPanelVisible,
  setActiveCommentId,
  saveBook,
}) {
  const [implementedComments, setImplementedComments] = useState([]); // [commentId, commentId, ...]
  const [comments, setComments] = useState([]);
  const [reportElems, setReportElems] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const { isLightMode, bookId, chapters } = useEditorContext();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  // Comments Loading State
  const {
    loadingProgress: commentsLoadingProgress,
    setLoadingProgress: setCommentsLoadingProgress,
    loadingMessage: commentsLoadingMessage,
    setLoadingMessage: setCommentsLoadingMessage,
    progressLimit: commentsProgressLimit,
    setProgressLimit: setCommentsProgressLimit,
    estimateTotalTime: commentsEstimateTotalTime,
    setEstimateTotalTime: setCommentsEstimateTotalTime,
  } = useLoadingProgress();
  const [isReportLoading, setIsReportLoading] = useState(false);

  const editorHtml = editor?.getHTML();

  // Hook to detect and update implemented comments
  useDetectImplementedComments(editorHtml, implementedComments, setImplementedComments);
  // Hook to highlight the active comment
  useHighlightActiveComment(activeCommentId);
  // Hook to detect comments from HTML and update comments in DB
  useDetectComments(editorHtml, comments, setComments, getAccessTokenSilently);

  // Get chat from DB on load
  useEffect(() => {
    if (isAuthenticated && bookId !== undefined) {
      getChat({ getAccessTokenSilently, bookId, plumeAPI, setConversations, setIsChatLoading, setActiveConversation });
    }
  }, [getAccessTokenSilently, isAuthenticated, bookId]);

  function addCommentsToHtml(newComments) {
    newComments.forEach((comment) => {
      // Comment on the current selection
      editor
        ?.chain()
        .setTextSelection({
          from: comment["character_start"],
          to: comment["character_end"],
        })
        .setComment(`comment${comment.id}`)
        .run();
    });
  }

  const saveData = async (chapters) => {
    if (isAuthenticated) {
      await saveBook(chapters);
    }
  };

  return (
    <div className={`Right-Panel ${!isRightPanelVisible ? "collapsed" : ""}`}>
      <div
        className={`Control-Panel
                  ${isRightPanelVisible ? "expanded" : "collapsed"} `}
      >
        <Tooltip id="brainstorm-tooltip"></Tooltip>
        <a data-tooltip-id="brainstorm-tooltip" data-tooltip-content="Chat with Quarkle">
          <img
            className={`Control-Panel-Icon ${selectedTab === "brainstorm" ? "selected" : ""}  ${isLightMode ? "light" : ""}`}
            alt="Brainstorm"
            src={brainstormImg}
            onClick={() => {
              setSelectedTab("brainstorm");
            }}
          ></img>
        </a>
        <Tooltip id="comment-tooltip"></Tooltip>
        <a data-tooltip-id="comment-tooltip" data-tooltip-content="Get suggestions for improvement">
          <img
            id="comments-tab"
            className={`Control-Panel-Icon ${selectedTab === "comment" ? "selected" : ""}  ${isLightMode ? "light" : ""}`}
            onClick={switchToCommentTab}
            alt="Comment feedback"
            src={commentimg}
          ></img>
          <Tooltip id="minimize-tooltip"></Tooltip>
        </a>
        <MinimizeButton isMinimized={!isRightPanelVisible} setIsMinimized={setRightPanelVisible} isLightMode={isLightMode} />
      </div>
      {selectedTab == "comment" && isRightPanelVisible && (
        <CritiqueTab
          editor={editor}
          activeCommentId={activeCommentId}
          comments={comments}
          setComments={setComments}
          reportElems={reportElems}
          setReportElems={setReportElems}
          saveData={saveData}
          setOpen={setOpen}
          setActiveCommentId={setActiveCommentId}
          addCommentsToHtml={addCommentsToHtml}
          implementedComments={implementedComments}
          commentsLoadingProgress={commentsLoadingProgress}
          commentsLoadingMessage={commentsLoadingMessage}
          commentsProgressLimit={commentsProgressLimit}
          commentsEstimateTotalTime={commentsEstimateTotalTime}
          setCommentsLoadingProgress={setCommentsLoadingProgress}
          setCommentsLoadingMessage={setCommentsLoadingMessage}
          setCommentsProgressLimit={setCommentsProgressLimit}
          setCommentsEstimateTotalTime={setCommentsEstimateTotalTime}
          isReportLoading={isReportLoading}
          setIsReportLoading={setIsReportLoading}
        />
      )}
      {isRightPanelVisible && selectedTab == "brainstorm" && (
        <BrainstormTab
          editor={editor}
          questionSuggested={questionSuggested}
          conversations={conversations}
          setConversations={setConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          isChatLoading={isChatLoading}
          setIsChatLoading={setIsChatLoading}
          recommendedQuestions={recommendedQuestions}
          setRecommendedQuestions={setRecommendedQuestions}
          saveData={saveData}
          setOpen={setOpen}
          addCommentsToHtml={addCommentsToHtml}
        />
      )}
    </div>
  );
}

export default EditorRightPanel;
