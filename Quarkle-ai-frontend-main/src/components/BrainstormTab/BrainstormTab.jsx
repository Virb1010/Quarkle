import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/src/components/ui/dropdown-menu";
import { useAuth0 } from "@auth0/auth0-react";
import { Tooltip } from "react-tooltip";

import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { startNewConversation } from "@/src/helpers/dbFunctions";
import { convertTimetoTimeAgo } from "@/src/helpers/utils";

import { useEditorContext } from "@/src/contexts/editorContext";
import { useAiService } from "@/src/contexts/aiContext";

import RecommendedQuestionsList from "@/src/components/BrainstormTab/RecommendedQuestionsList";
import ChatList from "@/src/components/BrainstormTab/ChatList";
import ChatInputBox from "@/src/components/BrainstormTab/ChatInputBox";

export default function BrainstormTab({
  questionSuggested,
  recommendedQuestions,
  setRecommendedQuestions,
  setOpen,
  addCommentsToHtml,
  saveData,
  conversations,
  setConversations,
  isChatLoading,
  setIsChatLoading,
  activeConversation,
  setActiveConversation,
}) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { bookId, chapterId, chapters, isLightMode, openExpressionEnabled } = useEditorContext();

  // AI Services
  const { AiChatService } = useAiService();

  const [askUserResponsePreference, setAskUserResponsePreference] = useState(null);
  const onUserResponseRef = useRef(null);

  const activeChatsList = conversations.find((conversation) => conversation.conversation_id === activeConversation)?.chats;

  // AI Functions

  // Get AI Chat Response
  function getQuarkleChatResponse() {
    saveData(chapters).catch(console.error);
    if (isAuthenticated) {
      AiChatService.start(
        getAccessTokenSilently,
        bookId,
        chapterId,
        activeConversation,
        addCommentsToHtml,
        setConversations,
        openExpressionEnabled,
        askUserForPreference,
      );
    } else {
      setOpen((o) => !o);
    }
  }

  function startNewConversationTriggered() {
    if (activeChatsList.length === 0) {
      return;
    }

    setActiveConversation(null);
    startNewConversation({ getAccessTokenSilently, bookId, plumeAPI, setConversations, setActiveConversation });
  }

  function switchConversation(conversation_id) {
    if (activeConversation === conversation_id) {
      return;
    }
    setActiveConversation(conversation_id);
  }

  function askUserForPreference() {
    return new Promise((resolve) => {
      setAskUserResponsePreference(true);
      onUserResponseRef.current = (response) => {
        setAskUserResponsePreference(false);
        resolve(response);
      };
    });
  }

  return (
    <div className={`Quarkle-Chat ${isLightMode ? "light" : ""}`}>
      <div className="Talk-to-Quarkle">
        <div className={`Brainstorm-Header-Container ${isLightMode ? "light" : ""}`}>
          {" "}
          <h1 className={isLightMode ? "text-black" : "text-white"}>Chat with Quarkle</h1>
          <div className="Brainstorm-Header-Container-Icons">
            <DropdownMenu className={`text-[#fff] dark:bg-[#070722]`}>
              <DropdownMenuTrigger asChild>
                <div>
                  <Tooltip id="new-chat-tooltip"></Tooltip>
                  <a data-tooltip-id="new-chat-tooltip" data-tooltip-content="Previous Chats">
                    <i
                      className={`pi pi-history ${
                        isLightMode ? "light-icon" : "dark-icon"
                      } cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700`}
                    ></i>
                  </a>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`max-h-[50vh] overflow-auto dark:bg-[#070722] dark:text-[#fff]`}>
                <DropdownMenuLabel className="text-m font-bold">All Chats </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={activeConversation}>
                  {conversations
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .map((conversation) => (
                      <DropdownMenuRadioItem
                        key={conversation.conversation_id}
                        onClick={() => switchConversation(conversation.conversation_id)}
                        value={conversation.conversation_id}
                      >
                        <div className="flex cursor-pointer flex-col space-y-1">
                          <h1 className="text-m font-bold">
                            <h1 className="text-m font-bold">
                              {conversation.title && conversation.title.length > 20
                                ? `${conversation.title.substring(0, 20)}...`
                                : conversation.title}
                            </h1>{" "}
                          </h1>{" "}
                          <p className="text-sm text-gray-500">
                            {convertTimetoTimeAgo(new Date(new Date(conversation.updated_at).getTime() - 330 * 60 * 1000))}
                          </p>{" "}
                        </div>{" "}
                      </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip id="new-chat-tooltip"></Tooltip>
            <a data-tooltip-id="new-chat-tooltip" data-tooltip-content="New Chat">
              <i
                className={`pi pi-plus-circle ${
                  isLightMode ? "light-icon" : "dark-icon"
                } cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700`}
                onClick={startNewConversationTriggered}
              ></i>
            </a>
          </div>
        </div>
        <div className="mt-[-10px] h-0 w-full self-end border border-[#bebed3] dark:border-[#323354]"></div>
        {!isChatLoading && (
          <>
            <div className={`Quarkle-Chat-Stuff ${isLightMode ? "light" : ""}`}>
              <div className={` Quarkle-Chat-Reply-Container ${isLightMode ? "light" : ""}`}>
                <p className={` Quarkle-Chat-Reply-Text ${isLightMode ? "light" : ""}`}>
                  Hi! My name is Quarkle! I'm here to polish your words and make your writing shine. How can I assist you today?
                </p>
              </div>
              <ChatList
                activeChatsList={activeChatsList}
                activeConversation={activeConversation}
                askUserResponsePreference={askUserResponsePreference}
                setAskUserResponsePreference={setAskUserResponsePreference}
                onUserResponseRef={onUserResponseRef}
              />
            </div>
          </>
        )}
        {isChatLoading && (
          <i className={`pi pi-spin pi-spinner ${isLightMode ? "light-icon" : "dark-icon"}`} style={{ fontSize: "1.5rem" }}></i>
        )}
        {!isChatLoading && (
          <div className="mt-auto w-full">
            <RecommendedQuestionsList
              questionSuggested={questionSuggested}
              recommendedQuestions={recommendedQuestions}
              getQuarkleChatResponse={getQuarkleChatResponse}
              setRecommendedQuestions={setRecommendedQuestions}
            />
            <ChatInputBox getQuarkleChatResponse={getQuarkleChatResponse} activeConversation={activeConversation} />
          </div>
        )}
      </div>
    </div>
  );
}
