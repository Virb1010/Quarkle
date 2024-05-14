import React, { useState, useRef } from "react";
import Image from "next/image";
import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { useAuth0 } from "@auth0/auth0-react";
import { convertToChapterObject } from "@/src/models/BooksModel";
import { FileUploadInstructionsPopup } from "@/src/components/Popups/FileUploadInstructionsPopup";

const importIcon = "/images/import.png";
function PdfToText({ onTextExtracted, bookId, setChaptersLoading, onlyIcon = false }) {
  const fileInputRef = useRef();
  const { getAccessTokenSilently } = useAuth0();
  const [open, setOpen] = useState(false);

  const onImportIconClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = async (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length) {
      setChaptersLoading(true);
      await sendFilesToBackend(selectedFiles); // Changed to sendFilesToBackend
      setChaptersLoading(false);
    }
  };

  const sendFilesToBackend = async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("file", file); // Changed to "files" and appending each file
    }
    formData.append("bookId", bookId);

    try {
      const token = await getAccessTokenSilently();

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000,
      };

      const response = await plumeAPI.post(`/books_api/chapters/upload_documents`, formData, config);

      const textContent = response.data;
      const chaptersContent = textContent.map((chapter) => convertToChapterObject(chapter));

      onTextExtracted(chaptersContent);
    } catch (error) {
      console.error("Error extracting text from file:", error);
      // Handle error appropriately
    }
  };

  return (
    <button
      className="flex min-w-min max-w-max items-center gap-2 rounded-md border-2 border-[#bebed3] p-2 px-3 text-sm font-bold hover:bg-gray-100 dark:border-[#35365d] dark:hover:bg-[#14142d]"
      onClick={onImportIconClick}
    >
      <Image className="invert filter dark:invert-0" src={importIcon} alt="import" width={16} height={16} />
      {!onlyIcon && <span className="text-[#14142d] dark:text-[#f8fafc]">Import</span>}{" "}
      <input type="file" multiple onChange={onFileChange} style={{ display: "none" }} ref={fileInputRef} />
      <i
        className="pi pi-info-circle hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      ></i>
      <FileUploadInstructionsPopup open={open} closeModal={() => setOpen(false)} />
    </button>
  );
}

export function PdfToTextIcon({ onTextExtracted, bookId, setChaptersLoading }) {
  return <PdfToText onTextExtracted={onTextExtracted} onlyIcon={true} bookId={bookId} setChaptersLoading={setChaptersLoading} />;
}

export default PdfToText;
