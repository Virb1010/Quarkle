import { saveAs } from "file-saver";
import { useEditorContext } from "@/src/contexts/editorContext";

export default function ExportButton({ editor }) {
  const { title, isLightMode } = useEditorContext();

  function copyToClipboard() {
    const content = editor.getText(); // Assuming editor.getHTML() returns the HTML content of the editor
    navigator.clipboard.writeText(content);
  }

  function onlyMe() {
    // print("only ME")
  }

  function anyoneWithLink() {
    // print("Anyone")
  }

  function downloadAsText() {
    let content = editor.getText(); // Assuming editor.getHTML() returns the HTML content of the editor

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, title);
  }

  return (
    <div className="dropdown relative flex items-center">
      <button className="flex items-center gap-2 rounded-lg border-2 border-[#bebed3] px-2 py-2 align-middle text-xs font-bold text-black hover:opacity-50 dark:border-[#323354] dark:text-white sm:px-3 sm:py-1 sm:text-base">
        <i className="pi pi-upload"></i>
        <span className="hidden sm:block">Access</span>
      </button>
      <div className={`dropdown-content ${isLightMode ? "light" : ""}`}>
        <a onClick={onlyMe}>Only Me</a>
        <a onClick={anyoneWithLink}>Anyone with the link</a>
      </div>
    </div>
  );
}
