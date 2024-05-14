"use client";
import { theAdventureOfTheSpeckledBand, test } from "@/src/components/Editor/Templates";
import { useEditorContext } from "@/src/contexts/editorContext";
import "@/src/styles/CustomTourStyles.css";
import mixpanel from "mixpanel-browser";

export const useTourSteps = () => {
  const { dispatch, chapters } = useEditorContext();

  const tourSteps = [
    {
      id: "intro",
      step: 1,

      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Exit",
          type: "cancel",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Hi I'm Quarkle, your personal AI editor!",
      text: ["Let’s get started with a quick tour of your writing space."],
      when: {
        show: () => {
          mixpanel.track("Tour Step - Intro");
        },
        hide: () => {},
      },
    },
    {
      id: "step2",
      attachTo: { element: ".Editor", on: "left" },
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Your Writing Canvas",
      text: ["This is where your creativity flows. Write your content here, and I’ll be ready with questions and notes in real-time."],
      when: {
        show: () => {
          mixpanel.track("Reached step 2");
        },
        hide: () => {},
      },
    },
    {
      id: "step3",
      attachTo: { element: "#Knowledge-Base", on: "right" },
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Knowledge Base",
      text: ["This is where my notes appear, I'll automatically detect the kind of work you're writing and adapt."],
      when: {
        show: () => {
          mixpanel.track("Reached step 3");
          const knowledgeBase = document.querySelector("#Knowledge-Base");
          if (knowledgeBase) {
            knowledgeBase.click();
          }
        },
        hide: () => {},
      },
    },
    {
      id: "step4",
      attachTo: { element: ".Quarkle-Chat", on: "left" },
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
          action: () => {
            const editor = document.querySelector(".Editor");
            if (editor) {
              editor.value = "Your pre-filled text goes here.";
            }
          },
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Chat with me here!",
      text: [
        "Anytime you need assistance, ask your question here. You can brainstorm ideas with me, ask for re-writes, or simply chat about anything!",
      ],
      when: {
        show: () => {
          mixpanel.track("Reached step 4");
        },
        hide: () => {},
      },
    },
    {
      id: "step5",
      attachTo: { element: ".Editor", on: "left" },
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Let's rewrite a sentence!",
      text: [
        "I've filled up the editor with some text for you. <em>Highlight the bolded sentence and click the ask Quarkle button</em> from the bubble menu that pops up.",
      ],
      when: {
        show: () => {
          mixpanel.track("Reached step 5");
          if (chapters.every((chapter) => !chapter.content)) {
            dispatch({ type: "title/set", payload: "The Adventure Of The Speckled Band" });
            dispatch({ type: "editor/insertContent", payload: theAdventureOfTheSpeckledBand });
          }
        },
        hide: () => {},
      },
    },
    {
      id: "step6",
      attachTo: { element: ".Quarkle-Chat", on: "left" },
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: false,
      cancelIcon: {
        enabled: true,
      },
      title: "How should I re-write it?",
      text: ["You can ask me to make it more poignant, funnier, add a linking sentence in the middle or really anything at all!"],
      when: {
        show: () => {
          mixpanel.track("Reached step 6");
        },
        hide: () => {},
      },
    },
    {
      id: "step7",
      attachTo: { element: "#comments-tab", on: "left" },
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Let's Get Some Feedback!",
      text: ["You can click on comments button to switch to the comments tab"],
      when: {
        show: () => {
          mixpanel.track("Reached step 7");
          const commentsTab = document.querySelector("#comments-tab");
          if (commentsTab) {
            commentsTab.click();
          }
        },
        hide: () => {},
      },
    },
    {
      id: "step8",
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "I'm Reading your Work",
      text: [
        "I'm going to annotate your text with some comments with feedback. You can always ask me for comments by simply asking in the chat!",
      ],
      when: {
        show: () => {
          mixpanel.track("Reached step 8");

          const commentsTab = document.querySelector("#ask-for-comments");
          if (commentsTab) {
            commentsTab.click();
          }
        },
        hide: () => {},
      },
    },
    {
      id: "step9",
      attachTo: { element: ".Comment-Action-Button", on: "bottom" },
      beforeShowPromise: function () {
        return new Promise(function checkElement(resolve) {
          const element = document.querySelector(".Comment-Action-Button");
          if (element) {
            resolve();
          } else {
            setTimeout(checkElement, 500, resolve);
          }
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary",
          text: "Next",
          type: "next",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Let's implement some feedback!",
      text: ["I can help you implement the feedback I've given you. Click on the Implement button to see how."],
      when: {
        show: () => {
          mixpanel.track("Reached step 9");
        },
        hide: () => {},
      },
    },
    {
      id: "step10",
      beforeShowPromise: function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: "shepherd-button-secondary",
          text: "Tinker",
          type: "cancel",
        },
        {
          classes: "shepherd-button-primary",
          text: "Back",
          type: "back",
        },
        {
          classes: "shepherd-button-primary refresh-button",
          text: "Start Fresh",
          type: "complete",
        },
      ],
      classes: "custom-class-name-1 custom-class-name-2",
      highlightClass: "highlight",
      scrollTo: true,
      cancelIcon: {
        enabled: true,
      },
      title: "Congratulations! You're All Set!",
      text: ["Would you like to tinker with this project or get some fresh paper to write on?"],
      when: {
        show: () => {
          mixpanel.track("Reached step 10");
          const clickHandler = function (event) {
            if (event.target.matches(".refresh-button")) {
              dispatch({ type: "title/set", payload: "" });
              dispatch({ type: "editor/reset" });
              document.body.removeEventListener("click", clickHandler);
            }
          };
          document.body.addEventListener("click", clickHandler);
        },
        hide: () => {},
      },
    },
  ];
  return tourSteps;
};
