import { useAiService } from "@/src/contexts/aiContext";
import { useEditorContext } from "@/src/contexts/editorContext";

import StopStreamingButton from "@/src/components/Buttons/StopStreamingButton";

export default function ChatInputBox({ getQuarkleChatResponse, activeConversation }) {
  const { bookId, chapterId, isLightMode } = useEditorContext();
  const { AiChatService, streamingStatus } = useAiService();
  const chatKey = AiChatService.createConnectionKey([bookId, chapterId, activeConversation]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      getQuarkleChatResponse();
    }
  };

  return (
    <div className="bottom-0 my-3 flex min-h-[100px] w-full resize-y flex-row self-center overflow-auto rounded-lg border border-[#bebed3] bg-white p-4 font-montserrat text-sm font-semibold text-[#14142d] outline-none placeholder:italic placeholder:text-[#41412c] dark:border-[#c6c5ed] dark:bg-[#af145f] dark:text-white dark:placeholder:text-white">
      <div
        id="Brainstorm-Input-ID"
        className="Chat-Input-Display w-full border-none bg-transparent outline-none"
        contentEditable="true"
        data-placeholder="Ask me anything..."
        onKeyDown={handleKeyDown}
      ></div>
      {streamingStatus[chatKey] && (
        <StopStreamingButton
          isLightMode={isLightMode}
          onClick={() => AiChatService.closeConnection([bookId, chapterId, activeConversation])}
          size="small"
          tooltipContent="Stop Streaming this Comment"
        />
      )}
    </div>
  );
}
