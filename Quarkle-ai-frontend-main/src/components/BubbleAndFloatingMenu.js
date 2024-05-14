import React from "react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react";
import { Tooltip } from "react-tooltip";

import "@/src/styles/EditorMenu.css";
import "@/src/styles/BubbleMenu.css";

const boldImg = "/images/bold.png";
const ItalicImg = "/images/italic.png";
const StrikeImg = "/images/strikethrough.png";
const highlightImg = "/images/highlight.png";
const elaborateImg = "/images/elaborate.png";
const embellishImg = "/images/embellish.png";
const conciseImg = "/images/concise.png";
const restructureImg = "/images/restructure.png";

function focusAtEnd(chatElement) {
  const range = document.createRange();
  range.selectNodeContents(chatElement);
  range.collapse(false); // Collapse the range to the end point, false means end of the content

  // Get the selection and remove all ranges (clear previous selections)
  const selection = window.getSelection();
  selection.removeAllRanges();

  // Add the new range to the selection
  selection.addRange(range);
  chatElement.focus();
}

const EditorMenu = ({ editor, setSelectedTab, ConnectWSServer, getSavedHighlightedText, isLightMode }) => {
  async function handleAskQuarkle() {
    await setSelectedTab("brainstorm");
    const chatElement = document.getElementById("Brainstorm-Input-ID");
    chatElement.innerHTML = `<blockquote>${getSavedHighlightedText}</blockquote><br><br>`;
    focusAtEnd(chatElement);
    chatElement.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  return (
    <div>
      {editor && (
        <BubbleMenu className={`bubble-menu  ${isLightMode ? "light" : ""}`} tippyOptions={{ duration: 100 }} editor={editor}>
          <Tooltip id="elaborate-tooltip">Expand on a piece of text</Tooltip>
          <div
            className={`AI-Tools-Container ${isLightMode ? "light" : ""}`}
            onClick={() => ConnectWSServer(getSavedHighlightedText, "Elaborate")}
          >
            <a data-tooltip-id="elaborate-tooltip" data-tooltip-content="Expand on a piece of text">
              <img className={`AI-Tools ${isLightMode ? "light" : ""}`} src={elaborateImg} alt="Elaborate" />
            </a>
            Elaborate
          </div>
          <Tooltip id="embellish-tooltip">Re-write and polish text</Tooltip>
          <div
            className={`AI-Tools-Container ${isLightMode ? "light" : ""}`}
            onClick={() => ConnectWSServer(getSavedHighlightedText, "Embellish")}
          >
            <a data-tooltip-id="embellish-tooltip" data-tooltip-content="Re-write and polish text ">
              <img className={`AI-Tools ${isLightMode ? "light" : ""}`} src={embellishImg} alt="Embellish" />
            </a>
            Embellish
          </div>
          <Tooltip id="concise-tooltip">Shorten a piece of text</Tooltip>
          <div
            className={`AI-Tools-Container ${isLightMode ? "light" : ""}`}
            onClick={() => ConnectWSServer(getSavedHighlightedText, "Concise")}
          >
            <a data-tooltip-id="concise-tooltip" data-tooltip-content="Shorten a piece of text ">
              <img className={`AI-Tools ${isLightMode ? "light" : ""}`} src={conciseImg} alt="Concise" />
            </a>
            Concise
          </div>
          <Tooltip id="restructure-tooltip">Restructure text for readability</Tooltip>
          <div
            className={`AI-Tools-Container ${isLightMode ? "light" : ""}`}
            onClick={() => ConnectWSServer(getSavedHighlightedText, "Restructure")}
          >
            <a data-tooltip-id="restructure-tooltip" data-tooltip-content="Restructure text for readability">
              <img className={`AI-Tools ${isLightMode ? "light" : ""}`} src={restructureImg} alt="Restructure" />
            </a>
            Restructure
          </div>
          <Tooltip id="ask-quarkle-tooltip">Ask Quarkle in Chat</Tooltip>
          <div id="Ask-Quarkle" className={`AI-Tools-Container ${isLightMode ? "light" : ""}`} onClick={() => handleAskQuarkle()}>
            <a data-tooltip-id="ask-quarkle-tooltip">
              <i className="pi pi-comments text-[35px] font-thin"></i>
            </a>
            Ask Quarkle
          </div>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "is-active" : ""}>
            <img src={boldImg} alt="Bold" />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "is-active" : ""}>
            <img src={ItalicImg} alt="Italic" />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "is-active" : ""}>
            <img src={StrikeImg} alt="Strike" />
          </button>
          <input
            type="color"
            className="Color-Picker"
            onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
            value={editor.getAttributes("textStyle").color}
          />
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive("highlight") ? "is-active" : ""}
          >
            <img src={highlightImg} alt="Highlight" />
          </button>
        </BubbleMenu>
      )}
      {editor && (
        <FloatingMenu className={`floating-menu ${isLightMode ? "light" : ""}`} tippyOptions={{ duration: 100 }} editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${editor.isActive("heading", { level: 1 }) ? "is-active" : ""} ${isLightMode ? "light" : ""}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${editor.isActive("heading", { level: 2 }) ? "is-active" : ""} ${isLightMode ? "light" : ""}`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${editor.isActive("heading", { level: 3 }) ? "is-active" : ""} ${isLightMode ? "light" : ""}`}
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${editor.isActive("bulletList") ? "is-active" : ""} ${isLightMode ? "light" : ""}`}
          >
            Bullet List
          </button>
        </FloatingMenu>
      )}
    </div>
  );
};

export default EditorMenu;
