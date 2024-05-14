import React from "react";
import "@/src/styles/EditorMenu.css";
import "@/src/styles/BubbleMenu.css";

const boldImg = "/images/bold.png";
const ItalicImg = "/images/italic.png";
const StrikeImg = "/images/strikethrough.png";
const UndoImg = "/images/undo.png";
const RedoImg = "/images/redo.png";

const BottomMenu = ({ editor, isLightMode }) => {
  return (
    <div className={`bottom-menu  ${isLightMode ? "light" : ""}`}>
      <div className={`Highlight-Instructions  ${isLightMode ? "light" : ""}`}>
        <i>Highlight Text for AI Tools</i>
      </div>
      <button
        onClick={() => editor && editor.chain().focus().toggleBold().run()}
        className={editor && editor.isActive("bold") ? "is-active" : ""}
      >
        <img src={boldImg} alt="Bold" />
      </button>
      <button
        onClick={() => editor && editor.chain().focus().toggleItalic().run()}
        className={editor && editor.isActive("italic") ? "is-active" : ""}
      >
        <img src={ItalicImg} alt="Italic" />
      </button>
      <button
        onClick={() => editor && editor.chain().focus().toggleStrike().run()}
        className={editor && editor.isActive("strike") ? "is-active" : ""}
      >
        <img src={StrikeImg} alt="Strike" />
      </button>
      <button onClick={() => editor && editor.chain().focus().undo().run()} disabled={!editor || !editor.can().undo()}>
        <img src={UndoImg} alt="Undo" />
      </button>
      <button onClick={() => editor && editor.chain().focus().redo().run()} disabled={!editor || !editor.can().redo()}>
        <img src={RedoImg} alt="Redo" />
      </button>
    </div>
  );
};

export default BottomMenu;
