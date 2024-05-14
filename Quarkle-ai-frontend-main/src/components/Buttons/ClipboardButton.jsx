import { useState } from "react";

export default function ClipboardButton({ msg }) {
  const [copied, setCopied] = useState(false);

  const handleClipboardClick = () => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="absolute -right-2 -top-5">
      {copied && <i className="pi pi-check h-5 w-5 cursor-pointer text-black dark:text-white"></i>}
      {!copied && <i className="pi pi-copy h-5 w-5 cursor-pointer text-black dark:text-white" onClick={handleClipboardClick}></i>}
    </div>
  );
}
