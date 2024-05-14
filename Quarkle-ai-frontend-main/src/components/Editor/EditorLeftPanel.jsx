import { useState, useEffect } from "react";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import PdfToText, { PdfToTextIcon } from "@/src/components/PdfReaderBackend";
import { useAuth0 } from "@auth0/auth0-react";
import { addChapter, deleteChapters, updateChapterTitle } from "@/src/helpers/dbFunctions";
import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { useEditorContext } from "@/src/contexts/editorContext";
import MinimizeLeftPanel from "../Buttons/MinimizeLeftPanel";
import { Separator } from "@/src/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import DeleteChapterPopup from "@/src/components/Popups/DeleteChapterPopup";
import ChaptersNavigation from "@/src/components/Chapters/ChaptersNavigation";
import KnowledgeBase from "@/src/components/KnowledgeBase/KnowledgeBase";

function EditorLeftPanel({ editor, wordCount, leftPanelVisible, setLeftPanelVisible }) {
  const { chapterId, chapters, bookId, isLightMode, dispatch } = useEditorContext();
  const { getAccessTokenSilently } = useAuth0();
  const [addingChapter, setAddingChapter] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deletingChapterId, setDeletingChapterId] = useState(null);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  function handleTitleChange(chapterId, newTitle) {
    updateChapterTitle({ getAccessTokenSilently, chapterId, title: newTitle, plumeAPI });

    dispatch({
      type: "chapters/updateTitle",
      payload: { chapterId, newTitle },
    });
  }

  useEffect(() => {
    if (editor) {
      const chapterToSet = chapters.find((chapter) => chapter.id === chapterId);
      if (chapterToSet) {
        editor.commands.setContent(chapterToSet.content);
      }
    }
  }, [chapterId]);

  function addChapterClick() {
    setAddingChapter(true);
    addChapter({ getAccessTokenSilently, bookId, plumeAPI, dispatch, chapters }).finally(() => {
      setAddingChapter(false);
    });
  }

  function setChapter(chapter_id) {
    dispatch({ type: "chapterId/set", payload: chapter_id });
  }

  function deleteChapterClick(chapter_id) {
    setDeletingChapterId(chapter_id);
    setDeletePopupOpen(true);
  }

  return (
    <div className={`Left-Panel ${leftPanelVisible ? "expanded" : "collapsed"} sm:h-[87vh]`}>
      <DeleteChapterPopup
        open={deletePopupOpen}
        setOpen={setDeletePopupOpen}
        deleteChapter={() => {
          deleteChapters({ getAccessTokenSilently, chapterId, plumeAPI });
          setDeletePopupOpen(false);
        }}
        closeModal={() => setDeletePopupOpen(false)}
      />
      <div
        className={`Left-Panel-Content  ${leftPanelVisible ? "expanded" : "collapsed"} ${isLightMode ? "light" : ""} flex h-full flex-col`}
      >
        {leftPanelVisible ? (
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center gap-4">
              <Tooltip id="back-to-projects-tooltip" />
              <Tooltip id="back-to-projects-tooltip" />
              <Link href="/studio" data-tooltip-id="back-to-projects-tooltip" data-tooltip-content="Back to My Projects">
                <i className="pi pi-home rounded-md p-2 text-lg text-black hover:bg-[#efeff2] dark:text-white dark:hover:bg-[#20203d]"></i>
              </Link>{" "}
              <Tooltip id="import-tooltip" />
              <a data-tooltip-id="import-tooltip" data-tooltip-content="Import PDF / Markdown files">
                <PdfToText
                  id="pdf-file-input"
                  className="hidden"
                  isLightMode={isLightMode}
                  bookId={bookId}
                  setChaptersLoading={setChaptersLoading}
                  onTextExtracted={(text) => {
                    dispatch({ type: "chapters/addMany", payload: text });
                  }}
                />
              </a>
            </div>
            <Separator />
            <div className="h-full">
              <Tabs defaultValue="Chapters" className="flex h-full flex-col">
                <TabsList className="my-2">
                  <TabsTrigger value="Chapters" className="flex-grow">
                    Chapters
                  </TabsTrigger>
                  <div>
                    <TabsTrigger id="Knowledge-Base" value="Knowledge">
                      Knowledge Base
                    </TabsTrigger>
                  </div>
                </TabsList>
                <TabsContent value="Chapters" className="flex-grow">
                  <ChaptersNavigation
                    chapters={chapters}
                    chapterId={chapterId}
                    setChapter={setChapter}
                    deletingChapterId={deletingChapterId}
                    deleteChapterClick={deleteChapterClick}
                    handleTitleChange={handleTitleChange}
                    chaptersLoading={chaptersLoading}
                    addingChapter={addingChapter}
                    addChapterClick={addChapterClick}
                    wordCount={wordCount}
                  />
                </TabsContent>
                <TabsContent className="flex-grow" value="Knowledge">
                  <KnowledgeBase bookId={bookId} getAccessTokenSilently={getAccessTokenSilently} plumeAPI={plumeAPI}></KnowledgeBase>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="Icons-container">
            <div>
              <Tooltip id="back-to-projects-tooltip"> </Tooltip>
              <Link href="/studio" tooltip-id="back-to-projects-tooltip" data-tooltip-content="Back to My Projects">
                <i className="pi pi-home mr-1 font-bold dark:text-white"></i>
              </Link>
            </div>
            <div>
              <Tooltip id="import-tooltip"></Tooltip>
              <a data-tooltip-id="import-tooltip" data-tooltip-content="Import a PDF">
                <PdfToTextIcon
                  id="pdf-file-input"
                  isLightMode={isLightMode}
                  bookId={bookId}
                  setChaptersLoading={setChaptersLoading}
                  onTextExtracted={(text) => {
                    dispatch({ type: "chapters/addMany", payload: text });
                  }}
                />
              </a>
            </div>
          </div>
        )}
        <MinimizeLeftPanel
          isMinimized={!leftPanelVisible}
          setIsMinimized={() => setLeftPanelVisible((prev) => !prev)}
          isLightMode={isLightMode}
          className={leftPanelVisible ? "absolute right-2 top-2" : "block"}
        />
      </div>
    </div>
  );
}

export default EditorLeftPanel;
