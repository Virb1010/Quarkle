import { useAiService } from "@/src/contexts/aiContext";
import { useEditorContext } from "@/src/contexts/editorContext";
import ReactMarkdown from "react-markdown";
import ClipboardButton from "@/src/components/Buttons/ClipboardButton";

export default function ChatList({
  activeChatsList,
  activeConversation,
  askUserResponsePreference,
  setAskUserResponsePreference,
  onUserResponseRef,
}) {
  const { AiChatService, streamingStatus } = useAiService();
  const { bookId, chapterId, isLightMode } = useEditorContext();
  const chatKey = AiChatService.createConnectionKey([bookId, chapterId, activeConversation]);

  return activeChatsList?.map((chat) => {
    const msg = chat["message"];
    if (chat["is_user"]) {
      return (
        <div className={`Quarkle-Chat-User-Container ${isLightMode ? "light" : ""}`} key={chat.id}>
          <ReactMarkdown className={`Quarkle-Chat-User-Text Markdown-Content-Display ${isLightMode ? "light" : ""}`}>{msg}</ReactMarkdown>
        </div>
      );
    } else {
      return (
        <div className={`Quarkle-Chat-Reply-Container ${isLightMode ? "light" : ""}`} key={chat.id}>
          <div className="relative flex w-full flex-col">
            {streamingStatus[chatKey] && msg.length === 0 && !askUserResponsePreference && <EllipsisDot />}
            {streamingStatus[chatKey] && msg.length === 0 && askUserResponsePreference && (
              <DisplayUserPreference setAskUserResponsePreference={setAskUserResponsePreference} onUserResponseRef={onUserResponseRef} />
            )}
            {msg.length !== 0 && <ClipboardButton msg={msg} />}
          </div>
          <span className={`Quarkle-Chat-Reply-Text ${isLightMode ? "light" : ""}`}>
            <ReactMarkdown className="Markdown-Content-Display">{msg}</ReactMarkdown>
          </span>
        </div>
      );
    }
  });
}

function EllipsisDot() {
  return (
    <span className="ellipsis text-black dark:text-white">
      <span className="ellipsis-dot">.</span>
      <span className="ellipsis-dot">.</span>
      <span className="ellipsis-dot">.</span>
    </span>
  );
}

function DisplayUserPreference({ setAskUserResponsePreference, onUserResponseRef }) {
  function handleUserResponsePreferenceClick(userResponsePreference) {
    setAskUserResponsePreference(false);
    if (onUserResponseRef.current) {
      onUserResponseRef.current(userResponsePreference);
    }
  }

  // Display the user response preference options - Comment or Chat as buttons
  return (
    <div className="flex flex-col items-center justify-center self-center font-montserrat">
      <div className="mb-3">
        <p className="text-center text-base text-black dark:text-[#c6c5ed]">How can I assist you?</p>
      </div>
      <div className="flex flex-row gap-x-4">
        <div
          className={`flex min-w-[6rem] flex-col items-center justify-center rounded-lg border border-[#bebed3] bg-[#c6c5ed] p-3 text-sm font-semibold text-[#14142d] outline-none hover:cursor-pointer hover:opacity-70 dark:border-[#c6c5ed] dark:bg-[#af145f] dark:text-white`}
          onClick={() => handleUserResponsePreferenceClick("GIVE_ME_COMMENTS")}
        >
          <p className="text-center">Comments</p>
        </div>
        <div
          className={`flex min-w-[6rem] flex-col items-center justify-center rounded-lg border border-[#bebed3] bg-[#c6c5ed] p-3 text-sm font-semibold text-[#14142d] outline-none hover:cursor-pointer hover:opacity-70 dark:border-[#c6c5ed] dark:bg-[#af145f] dark:text-white`}
          onClick={() => handleUserResponsePreferenceClick("GIVE_ME_CHAT")}
        >
          <p className="text-center">Chat</p>
        </div>
      </div>
    </div>
  );
}
