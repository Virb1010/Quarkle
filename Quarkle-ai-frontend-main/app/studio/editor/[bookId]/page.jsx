"use client";

import "@/src/styles/NewEditor.css";
import "@/src/styles/QuarkleChat.css";
import "@/src/styles/EditorLight.css";
import "react-tooltip/dist/react-tooltip.css";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import mixpanel from "mixpanel-browser";
import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { saveChapters, createBook, fetchSingleBookDataFromDb } from "@/src/helpers/dbFunctions";
import { useQuarkleEditor } from "@/src/editor/editor";
import { useEditorContext } from "@/src/contexts/editorContext";
import { debounce, encodeBookId, decodeBookId } from "@/src/helpers/utils"; // Ensure this import is at the top of your file

import LoginPopup from "@/src/components/Popups/LoginPopup";
import { InvalidBookPopup } from "@/src/components/Popups/InvalidBookPopup";
import EditorNavbar from "@/src/components/Editor/EditorNavbar";
import EditorLeftPanel from "@/src/components/Editor/EditorLeftPanel";
import EditorDocument from "@/src/components/Editor/EditorDocument";
import EditorRightPanel from "@/src/components/Editor/EditorRightPanel";
import { useAiService } from "@/src/contexts/aiContext";
import { useTour } from "@/src/hooks/useTour";
import { usePathname, useRouter } from "next/navigation";
import { Progress } from "@/src/components/ui/progress";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/src/components/ui/resizable";

const loading = "/images/logo_white_large.png";

function Editor() {
  const pathname = usePathname();
  const bookIdFromUrl = parseInt(decodeBookId(pathname.split("/")[3]));
  const router = useRouter();

  const { title, bookId, chapterId, chapters, isLightMode, openExpressionEnabled, isStudioReady, isEditorReady, dispatch } =
    useEditorContext();
  const { AiRecommendedQuestionsService, AiToolBarService, AiDetectCategoryService } = useAiService();

  const [openLoginPopup, setOpenLoginPopup] = useState(false);
  const [openInvalidBookPopup, setOpenInvalidBookPopup] = useState(false);
  const [getLastSave, setLastSave] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [isRightPanelVisible, setRightPanelVisible] = useState(true);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);

  const [selectedTab, setSelectedTab] = useState("brainstorm");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [loadingBarComplete, setLoadingBarComplete] = useState(false);
  const questionSuggested = useRef(false);

  const commentsSectionRef = useRef(null);
  let displayContent = chapters.find((chapter) => chapter.id === chapterId)?.content;

  // Refresh editor state when the component unmounts
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const focusCommentWithActiveId = (id) => {
    const commentInput = document.getElementById(`${id}`);
    if (commentInput) {
      commentInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const saveBook = useCallback(
    (chapters, currentBookId) => {
      return new Promise((resolve, reject) => {
        if (isAuthenticated) {
          if (isSaving) {
            resolve("Already Saving");
            return;
          }
          saveChapters({
            getAccessTokenSilently,
            chapters,
            setLastSave,
            plumeAPI,
            setIsSaving,
            bookId: currentBookId,
          })
            .then(resolve)
            .catch(reject);
        } else {
          setOpenLoginPopup((o) => !o);
          resolve("Not Saved");
        }
      });
    },
    [isAuthenticated, isSaving, getAccessTokenSilently, plumeAPI, setIsSaving, setOpenLoginPopup, bookId],
  );

  // Define the debounced function
  const debouncedSaveData = useCallback(
    debounce((chapters) => {
      if (bookId) {
        saveBook(chapters, bookId).catch(console.error);
      }
    }, 1000),
    [bookId],
  );

  const editor = useQuarkleEditor({
    displayContent,
    questionSuggested,
    setActiveCommentId,
    focusCommentWithActiveId,
    switchToCommentTab,
    setIsSaving,
    debouncedSaveData,
    setWordCount,
    getQuarkleRecommendedQuestions,
    getQuarkleCategoryDetection,
  });

  useEffect(() => {
    if (!isStudioReady || !isAuthenticated) return;

    if (bookIdFromUrl && bookIdFromUrl !== 0) {
      fetchSingleBookDataFromDb({ isAuthenticated, bookId: bookIdFromUrl, setOpenInvalidBookPopup, dispatch });
    } else if (bookIdFromUrl === 0) {
      createBook({ getAccessTokenSilently, bookId: bookIdFromUrl, title, editor, plumeAPI, setIsSaving, dispatch });
    }
  }, [bookIdFromUrl, dispatch, isAuthenticated, editor, isStudioReady]);

  // Update bookId into url when it changes
  useEffect(() => {
    if (bookId) {
      router.push(`/studio/editor/${encodeBookId(bookId)}`, { shallow: true });
    }
  }, [bookId]);

  // Refresh editor state when the component unmounts
  useEffect(() => {
    mixpanel.track("Entered Editor");
    return () => {
      dispatch({ type: "editor/refresh" });
    };
  }, []);

  if (typeof window !== "undefined") {
    useTour();
  }

  function switchToCommentTab() {
    setSelectedTab("comment");
  }

  function toggleCommentsLightMode(mode) {
    // Query all elements with the 'data-comment-id' attribute.
    const commentElements = document.querySelectorAll(".my-comment");

    // Loop through the NodeList
    commentElements.forEach((element, index) => {
      if (mode === "light") {
        setTimeout(
          () => {
            element.classList.add("light");
          },
          100 * (index + 1),
        );
      } else {
        element.classList.remove("light");
      }
    });
  }

  useEffect(() => {
    const color = isLightMode ? "light" : "";
    toggleCommentsLightMode(color);
  }, [isLightMode]);

  function getQuarkleRecommendedQuestions(chapters, bookId) {
    if (isAuthenticated && recommendedQuestions.length === 0) {
      saveBook(chapters, bookId).then(() => {
        AiRecommendedQuestionsService.start(getAccessTokenSilently, bookId, chapterId, setRecommendedQuestions);
      });
    } else {
      setOpenLoginPopup((o) => !o);
    }
  }

  function getQuarkleCategoryDetection(chapters, chapterId, bookId) {
    if (isAuthenticated) {
      saveBook(chapters, bookId).then(() => {
        console.log("Detecting Category", chapters, bookId, chapterId);
        AiDetectCategoryService.start(getAccessTokenSilently, bookId, chapterId, dispatch);
      });
    } else {
      setOpenLoginPopup((o) => !o);
    }
  }

  function ConnectWSServer(inputText, action) {
    mixpanel.track("Quarkle Menu", {
      action: action,
      text: inputText,
    });

    if (isAuthenticated) {
      editor.commands.insertContent(`<span>${inputText}<br>> </span>`);
      AiToolBarService.start(
        action,
        inputText,
        editor,
        getAccessTokenSilently,
        bookId,
        chapterId,
        chapters,
        openExpressionEnabled,
        isAuthenticated,
        saveBook,
      );
    } else {
      setOpenLoginPopup((o) => !o);
    }
  }

  return (
    <div className={`min-h-screen  bg-gradient-radial-light-2 pt-2 dark:bg-gradient-radial-dark`}>
      <LoginPopup setOpen={setOpenLoginPopup} />
      <InvalidBookPopup open={openInvalidBookPopup} closeModal={() => setOpenInvalidBookPopup(false)} />
      <EditorNavbar editor={editor} />
      <div className={`flex w-full flex-row items-start justify-start  ${isLightMode ? "light" : ""}`}>
        <div className="Main">
          {isEditorReady && loadingBarComplete && (
            <ResizablePanelGroup direction={isSmallScreen ? "vertical" : "horizontal"} className="mx-3">
              <ResizablePanel
                defaultSize={20}
                className={`no-transition min-h-[22rem] w-full ${leftPanelVisible ? "sm:min-w-[18rem]" : "sm:min-w-[5rem]"}`}
              >
                <EditorLeftPanel
                  editor={editor}
                  chapters={chapters}
                  wordCount={wordCount}
                  leftPanelVisible={leftPanelVisible}
                  setLeftPanelVisible={setLeftPanelVisible}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="mx-2 hidden sm:block" />

              <ResizablePanel defaultSize={50} className="no-transition min-h-[40rem] w-full sm:min-w-[40rem]">
                <EditorDocument
                  editor={editor}
                  isSaving={isSaving}
                  commentsSectionRef={commentsSectionRef}
                  setSelectedTab={setSelectedTab}
                  ConnectWSServer={ConnectWSServer}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="mx-2 hidden sm:block" />

              <ResizablePanel
                defaultSize={27}
                className={`no-transition min-h-[33rem] w-full ${isRightPanelVisible ? "sm:min-w-[18rem]" : "sm:min-w-[5rem]"}`}
              >
                <EditorRightPanel
                  editor={editor}
                  isRightPanelVisible={isRightPanelVisible}
                  activeCommentId={activeCommentId}
                  setOpen={setOpenLoginPopup}
                  selectedTab={selectedTab}
                  switchToCommentTab={switchToCommentTab}
                  setSelectedTab={setSelectedTab}
                  questionSuggested={questionSuggested}
                  recommendedQuestions={recommendedQuestions}
                  setRecommendedQuestions={setRecommendedQuestions}
                  setRightPanelVisible={setRightPanelVisible}
                  setActiveCommentId={setActiveCommentId}
                  saveBook={saveBook}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
          <EditorLoader bookId={bookIdFromUrl} isLoading={!isEditorReady} setLoadingBarComplete={setLoadingBarComplete} />
        </div>
      </div>
    </div>
  );
}
export default Editor;

function EditorLoader({ isLoading, bookId, setLoadingBarComplete }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [delayComplete, setDelayComplete] = useState(false);
  const loadingTime = isLoading ? 5 : 0.1;

  useEffect(() => {
    if (bookId !== 0) {
      const timer = setInterval(
        () => {
          setLoadingProgress((prevProgress) => {
            if (prevProgress < 100) {
              return prevProgress + 1;
            } else if (prevProgress === 100 && !delayComplete) {
              setTimeout(() => {
                setDelayComplete(true);
                setLoadingBarComplete(true);
              }, 100); // wait for 100ms
              return prevProgress;
            } else if (prevProgress === 100 && delayComplete && !isLoading) {
              return 101;
            } else {
              return prevProgress;
            }
          });
        },
        (loadingTime * 1000) / 100,
      );
      return () => clearInterval(timer);
    }
  }, [bookId, isLoading, delayComplete]);

  return (
    loadingProgress < 101 && (
      <div className="absolute left-1/2 top-1/2 flex w-[30rem] -translate-x-1/2 -translate-y-1/2 transform flex-col">
        <>
          {<img className="h-24 w-24 animate-pulse self-center invert filter dark:invert-0" src={loading} alt={"Loading"}></img>}
          <p className="my-1 text-center text-xl font-semibold text-black dark:text-white">{loadingProgress}%</p>
          <Progress value={loadingProgress} />
        </>
      </div>
    )
  );
}
