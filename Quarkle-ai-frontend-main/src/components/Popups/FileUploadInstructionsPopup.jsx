import Popup from "reactjs-popup";
const QuarkleImage = "/images/quarkle.png";

export function FileUploadInstructionsPopup({ open, closeModal }) {
  return (
    <Popup open={open} closeOnDocumentClick onClose={closeModal}>
      <div className="flex w-full flex-col items-center rounded-lg border-2 border-[#bebed3] bg-[#af145f] p-5">
        <img className="mt-4 h-20 w-20 self-center rounded-full" src={QuarkleImage} alt="Quarkle!" />
        <div className="max-h-52 overflow-y-auto text-xl sm:max-h-[36rem]">
          <div className="flex h-full max-w-3xl flex-col items-center justify-center text-white sm:text-lg">
            <i className="pi pi-times absolute right-2 top-2 cursor-pointer rounded-full p-1" onClick={closeModal}></i>
            <h1 className="font-bold sm:text-2xl">File Upload Instructions</h1>
            <p className="mt-4">Please follow these guidelines when uploading your book documents:</p>

            <h2 className="mt-4 font-semibold sm:text-xl">Single File Upload:</h2>
            <ul className="ml-5 list-disc text-left">
              <li>
                If you upload a <strong>single PDF or Markdown file</strong>, the system will automatically parse the document into
                chapters.
              </li>
              <li>
                For PDFs, chapters are determined based on sections where the text is in bold. Ensure your document has clear{" "}
                <strong>bold</strong> headings to mark each chapter.
              </li>
              <li>
                Markdown files should use proper heading tags (like `# Chapter 1 Title` or `## Chapter 2 Title`) for chapter separation.
              </li>{" "}
            </ul>

            <h2 className="mt-4 font-semibold sm:text-xl">Multiple File Upload:</h2>
            <ul className="ml-5 list-disc text-left">
              <li>
                You can also choose to upload <strong>multiple files</strong>, with each file representing a separate chapter.
              </li>
              <li>The title of each file will be used as the chapter title, so please name your files accordingly.</li>
              <li>This is ideal if you have already separated your book into different files for each chapter.</li>
            </ul>

            <p className="mt-4">
              Supported file formats are <strong>PDF and Markdown</strong>. Please ensure your files are in one of these formats.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-3">
          <button
            className="cursor-pointer rounded-lg border-2 border-white px-3 font-montserrat text-lg font-semibold text-white hover:opacity-50"
            onClick={closeModal}
          >
            Got it
          </button>
        </div>
      </div>
    </Popup>
  );
}
