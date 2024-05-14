"use client";

import { createContext, useContext, useState } from "react";
import { AiComments, AiChat, AiRecommendedQuestions, AiToolBar, AiCommentImplementation, AiDetectCategory } from "@/src/helpers/aiService";

const AiServiceContext = createContext();

export const AiServiceProvider = ({ children }) => {
  const AiCommentsService = AiComments.getInstance();
  const AiChatService = AiChat.getInstance();
  const AiRecommendedQuestionsService = AiRecommendedQuestions.getInstance();
  const AiToolBarService = AiToolBar.getInstance();
  const AiDetectCategoryService = AiDetectCategory.getInstance();
  const AiCommentImplementationService = AiCommentImplementation.getInstance();

  const [streamingStatus, setStreamingStatus] = useState({});

  const updateStreamingStatus = (key, status) => {
    setStreamingStatus((prevStatus) => ({ ...prevStatus, [key]: status }));
  };

  AiChatService.setStreamingStatusChangeCallback(updateStreamingStatus);
  AiCommentImplementationService.setStreamingStatusChangeCallback(updateStreamingStatus);
  AiCommentsService.setStreamingStatusChangeCallback(updateStreamingStatus);

  return (
    <AiServiceContext.Provider
      value={{
        AiCommentsService,
        AiCommentImplementationService,
        AiChatService,
        AiRecommendedQuestionsService,
        AiToolBarService,
        AiDetectCategoryService,
        streamingStatus,
      }}
    >
      {children}
    </AiServiceContext.Provider>
  );
};

export const useAiService = () => {
  const context = useContext(AiServiceContext);
  if (!context) {
    throw new Error("useAiService must be used within a AiServiceProvider");
  }
  return context;
};
