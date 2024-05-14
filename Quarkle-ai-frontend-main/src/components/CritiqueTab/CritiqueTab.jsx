"use client";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Tooltip } from "react-tooltip";
import ReactMarkdown from "react-markdown";

import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { AiReport } from "@/src/helpers/aiFunctions";

import { useAiService } from "@/src/contexts/aiContext";
import { useEditorContext } from "@/src/contexts/editorContext";

import { CommentList } from "@/src/components/CritiqueTab/CommentList";
import { Progress } from "@/src/components/ui/progress";
import StopStreamingButton from "@/src/components/Buttons/StopStreamingButton";

const critique = "/images/critique.png";
const loading = "/images/logo_white_large.png";

export default function CritiqueTab({
  editor,
  activeCommentId,
  comments,
  setComments,
  reportElems,
  setReportElems,
  saveData,
  setOpen,
  setActiveCommentId,
  addCommentsToHtml,
  implementedComments,

  // Loading States
  commentsLoadingProgress,
  setCommentsLoadingProgress,
  commentsLoadingMessage,
  setCommentsLoadingMessage,
  commentsProgressLimit,
  setCommentsProgressLimit,
  commentsEstimateTotalTime,
  setCommentsEstimateTotalTime,
  isReportLoading,
  setIsReportLoading,
}) {
  const { isLightMode, chapters, chapterId, bookId } = useEditorContext();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { AiCommentsService } = useAiService();

  function formatReportArray(reportArray) {
    // add '*' before each item
    // Join them with \n
    return reportArray.map((item) => `- ${item} \n`).join("");
  }

  // Get AI Comments
  function getQuarkleComments(userInput) {
    setCommentsLoadingProgress(0);
    saveData(chapters).catch(console.error);
    if (isAuthenticated) {
      AiCommentsService.start(
        getAccessTokenSilently,
        bookId,
        chapterId,
        addCommentsToHtml,
        setCommentsLoadingProgress,
        setCommentsProgressLimit,
        setCommentsLoadingMessage,
        setCommentsEstimateTotalTime,
      );
    } else {
      setOpen((o) => !o);
    }
  }
  // Get AI Report
  async function getQuarkleCriticalSummary() {
    setIsReportLoading(true);
    try {
      saveData(chapters).catch(console.error);
      if (isAuthenticated) {
        AiReport(getAccessTokenSilently, chapterId, chapters, setReportElems, setIsReportLoading, plumeAPI, saveData);
      } else {
        setOpen((o) => !o);
      }
    } catch (error) {}
  }

  return (
    <div className={`Quarkle-Comments ${isLightMode ? "light" : ""}`}>
      <CritiqueLoaderBar
        loadingProgress={commentsLoadingProgress}
        loadingMessage={commentsLoadingMessage}
        stopStreaming={() => AiCommentsService.closeConnection([bookId, chapterId])}
        estimateTotalTime={commentsEstimateTotalTime}
      />
      <CommentList
        editor={editor}
        activeCommentId={activeCommentId}
        saveData={saveData}
        setOpen={setOpen}
        setActiveCommentId={setActiveCommentId}
        implementedComments={implementedComments}
        comments={comments}
        setComments={setComments}
      />
      {reportElems.length ? (
        reportElems.map((report) => (
          <div key={report.id} className={`report-component ${isLightMode ? "light" : ""}`}>
            <div className={`Top-Bar-Report ${isLightMode ? "light" : ""}`}>
              <span className={`span-class ${isLightMode ? "light" : ""}`}>
                <a className="Report-Title">{report.title}</a>
              </span>
              <Tooltip id="resolve-tooltip"></Tooltip>
              <a data-tooltip-id="resolve-tooltip" data-tooltip-content="Resolve this report">
                <i
                  className="pi pi-check mr-1 font-bold dark:text-white"
                  onClick={() => {
                    setReportElems(reportElems.filter((r) => r.id !== report.id));
                  }}
                ></i>
              </a>
            </div>
            <div className="Report-input-text">
              <ReactMarkdown className="Markdown-Content-Display">
                {Array.isArray(report.content) ? formatReportArray(report.content) : report.content}
              </ReactMarkdown>
            </div>
          </div>
        ))
      ) : (
        <span className="text-empty"></span>
      )}
      {isReportLoading && <img className="loading-gif-thinking invert filter dark:invert-0" src={loading} alt={"Loading"}></img>}
      {commentsLoadingProgress === 100 && !isReportLoading && (
        <>
          <div
            id="ask-for-comments"
            className={`Quarkle-Comment-Feedback-Confirm ${isLightMode ? "light" : ""}`}
            onClick={getQuarkleComments}
          >
            <span className="px-3 text-2xl">✨ </span>
            Comment Me Some Cosmic Critique →
          </div>
          <div className={`Quarkle-Comment-Feedback-Confirm ${isLightMode ? "light" : ""}`} onClick={getQuarkleCriticalSummary}>
            <img className={`Editorial-Report ${isLightMode ? "light" : ""}`} src={critique} alt="critique"></img> Give Me An Overall Report
            →
          </div>
        </>
      )}
    </div>
  );
}

function CritiqueLoaderBar({ stopStreaming, loadingMessage, loadingProgress, estimateTotalTime = 30 }) {
  const { isLightMode } = useEditorContext();

  return (
    loadingProgress < 100 && (
      <div className="my-4 flex flex-col gap-2">
        <div className="flex w-[80%] items-center justify-center gap-2 self-center align-middle">
          <div className="flex w-full flex-col">
            <p className="py-1 text-xs font-bold text-gray-500">{loadingMessage}...</p>
            <Progress value={loadingProgress} className="" />
            {estimateTotalTime === null && <p className="py-1 text-right text-xs italic text-gray-500">Estimating...</p>}
            {estimateTotalTime < 0 && <p className="py-1 text-right text-xs italic text-gray-500">Taking a little longer than expected</p>}
            {estimateTotalTime > 0 && (
              <p className="py-1 text-right text-xs italic text-gray-500">About {estimateTotalTime} secs remaining</p>
            )}
          </div>
          <StopStreamingButton
            isLightMode={isLightMode}
            onClick={() => stopStreaming()}
            size="large"
            tooltipContent="Stop Streaming Comments"
          />
        </div>
      </div>
    )
  );
}
