"use client";

import { useEffect, useState } from "react";
import { EditorContent } from "@tiptap/react";
import Image from "next/image";

import { useEditorContext } from "@/src/contexts/editorContext";

import EditorMenu from "@/src/components/BubbleAndFloatingMenu";
import BottomMenu from "@/src/components/BottomMenu";

const savingImg = "/images/saveCloud.png";

function EditorDocument({ editor, isSaving, setSelectedTab, commentsSectionRef, ConnectWSServer }) {
  const [getSavedHighlightedText, setSavedHighlightedText] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const { isLightMode } = useEditorContext();

  useEffect(() => {
    if (highlightedText) {
      setSavedHighlightedText(highlightedText);
    }
  }, [highlightedText]);

  useEffect(() => {
    const saveSelection = () => {
      var selection = window.getSelection().toString();
      setHighlightedText(selection);
      let elements = document.getElementsByClassName("Quarkle-Menu-Element");
      for (let i in elements) {
        if (selection.length > 0) {
          if (elements.hasOwnProperty(i)) {
            elements[i].style.opacity = "1.0";
          }
        } else {
          if (elements.hasOwnProperty(i)) {
            elements[i].style.opacity = "0.4";
          }
        }
      }
    };
    document.addEventListener("mouseup", saveSelection);
    document.addEventListener("keyup", saveSelection); // Add this line
    return () => {
      document.removeEventListener("mouseup", saveSelection);
      document.removeEventListener("keyup", saveSelection); // And this line
    };
  }, []);

  return (
    <div className="Document-Panel">
      <div className="ml-5 flex h-5 w-fit items-center gap-1 rounded border border-[#bebed3] bg-white p-1 text-xs text-[#14142d] dark:border-none dark:bg-[#323354] dark:text-white">
        <Image className="invert filter dark:invert-0" src={savingImg} alt="saving to cloud..." width={15} height={15} />
        {isSaving && <span>Saving...</span>}
        {!isSaving && <span>Saved</span>}
      </div>
      <div className="mx-auto my-0 h-[87vh] w-11/12 rounded-lg border-2 border-[#bebed3] bg-white text-black dark:border-[#323354] dark:bg-[#070722] sm:w-full ">
        <EditorMenu
          editor={editor}
          setSelectedTab={setSelectedTab}
          isLightMode={isLightMode}
          ConnectWSServer={ConnectWSServer}
          getSavedHighlightedText={getSavedHighlightedText}
        />
        {!highlightedText && <BottomMenu editor={editor} isLightMode={isLightMode} />}
        <EditorContent
          className={`Editor ${isLightMode ? "light" : ""}`}
          editor={editor}
          onMouseEnter={() => {
            setSavedHighlightedText(highlightedText);
          }}
        />
        <section className="section-class" ref={commentsSectionRef}></section>
      </div>
    </div>
  );
}

export default EditorDocument;
