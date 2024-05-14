import React from "react";

function ChaptersList({ chapters, chapterId, setChapter, deletingChapterId, deleteChapterClick, handleTitleChange }) {
  return chapters.map((chapter) => {
    if (!chapter) {
      return null;
    }

    return (
      <div
        key={chapter.id}
        className={`border-1 flex items-center justify-between gap-1 rounded-md border-[#35365d] p-2 text-sm font-semibold hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-[#14142d] ${
          chapterId === chapter.id ? "bg-[#c6c5ed] dark:bg-[#14142d]" : ""
        } ${deletingChapterId === chapter.id ? "deleting" : ""}`}
        onClick={() => setChapter(chapter.id)}
      >
        <input
          className={`w-[90%] bg-transparent ${chapterId === chapter.id ? "text-black dark:text-white" : "text-gray-400"}`}
          value={chapter.title}
          onChange={(e) => handleTitleChange(chapter.id, e.target.value)}
        ></input>
        {chapters.length > 1 && chapterId === chapter.id && (
          <i
            className="pi pi-minus-circle"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering setChapter
              deleteChapterClick(chapter.id);
            }}
          ></i>
        )}
      </div>
    );
  });
}

export default function ChaptersNavigation({
  chapters,
  chapterId,
  setChapter,
  deletingChapterId,
  deleteChapterClick,
  handleTitleChange,
  chaptersLoading,
  addingChapter,
  addChapterClick,
  wordCount,
}) {
  return (
    <div className="flex h-full flex-grow flex-col">
      <div className="h-full">
        <div className="max-h-[10svh] overflow-y-auto sm:max-h-[50svh]">
          {!chaptersLoading && (
            <ChaptersList
              chapters={chapters}
              chapterId={chapterId}
              setChapter={setChapter}
              deletingChapterId={deletingChapterId}
              deleteChapterClick={deleteChapterClick}
              handleTitleChange={handleTitleChange}
            />
          )}
          {chaptersLoading && (
            <div className="flex h-full items-center justify-center">
              <i className="pi pi-spinner pi-spin"></i>
            </div>
          )}
        </div>
        {!addingChapter && (
          <button
            className="border-1 flex items-center gap-1 rounded-md border-[#35365d] p-2 text-sm font-bold hover:bg-gray-100 dark:hover:bg-[#14142d]"
            onClick={addChapterClick}
          >
            <i className="pi pi-plus"></i>
            Add Chapter
          </button>
        )}
      </div>
      {wordCount > 0 && (
        <div className="mt-auto w-full justify-center rounded-lg text-center dark:bg-[#20203d] dark:text-white">
          <b>Word Count:</b> {wordCount}
        </div>
      )}
    </div>
  );
}
