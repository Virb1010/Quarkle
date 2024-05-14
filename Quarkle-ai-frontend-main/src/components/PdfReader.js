"use client";

// src/components/PdfReader.js
import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import Image from "next/image";

const importIcon = "/images/import.png";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PdfToText({ onTextExtracted, onlyIcon = false }) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(); // Create a ref

  useEffect(() => {
    if (file) {
      extractText();
    }
  }, [file]); // This will run whenever `file` changes

  const onImportIconClick = () => {
    fileInputRef.current.click(); // Trigger file input click on div click
  };

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const extractText = async () => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result);

      // Create PDF.js document
      const pdf = await pdfjs.getDocument(typedArray).promise;

      let textContent = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        // Load each page
        const page = await pdf.getPage(i);

        // Retrieve text content
        const text = await page.getTextContent();
        const strings = text.items.map((item) => item.str);
        textContent += strings.join(" ");
      }
      onTextExtracted(textContent); // Call the callback function with the extracted text
    };
  };

  return (
    <button
      className="flex min-w-min max-w-max items-center gap-2 rounded-md border-2 border-[#bebed3] p-2 px-3 text-sm font-bold hover:bg-gray-100 dark:border-[#35365d] dark:hover:bg-[#14142d]"
      onClick={onImportIconClick}
    >
      <Image className="invert filter dark:invert-0" src={importIcon} alt="import" width={16} height={16}></Image>
      {!onlyIcon && <span className="text-[#14142d] dark:text-[#f8fafc]">Import</span>}
      <input type="file" onChange={onFileChange} style={{ display: "none" }} ref={fileInputRef} />
    </button>
  );
}

export function PdfToTextIcon({ onTextExtracted }) {
  return <PdfToText onTextExtracted={onTextExtracted} onlyIcon={true}></PdfToText>;
}

export default PdfToText;
