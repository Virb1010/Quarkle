"use client";

import "shepherd.js/dist/css/shepherd.css";
import { useShepherdTour } from "react-shepherd";
import { useTourSteps } from "@/src/components/TourSteps/TourSteps";
import { useEffect, useRef } from "react";
import { getBooksFromIndexedDB } from "@/src/helpers/indexedDB";
import { useEditorContext } from "@/src/contexts/editorContext";

export function useTour() {
  const tourStartedId = useRef(null);

  const tourOptions = {
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
    },
    useModalOverlay: true,
  };

  const tourSteps = useTourSteps();
  const tour = useShepherdTour({ tourOptions, steps: tourSteps });
  const { books, isEditorReady } = useEditorContext();

  useEffect(() => {
    const checkAndStartTour = async () => {
      try {
        if (tour.isActive() || !isEditorReady || tourStartedId.current !== null) {
          return;
        }
        if (books.length === 0) {
          tour.start();
          tourStartedId.current = tour.id;
        }
        if (books.length === 1) {
          const currentBook = books[0];
          const isBookEmpty =
            currentBook.chapters.every((chapter) => !chapter.content) && (!currentBook.title || currentBook.title === "Untitled Draft");
          if (isBookEmpty) {
            tour.start();
            tourStartedId.current = tour.id;
          }
        }
      } catch (error) {
        console.error("Error accessing IndexedDB:", error);
      }
    };

    checkAndStartTour();
  }, [isEditorReady, books]);

  useEffect(() => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.addedNodes.length) {
          const askQuarkleButton = document.querySelector("#Ask-Quarkle");
          if (askQuarkleButton && tour.isActive()) {
            askQuarkleButton.addEventListener("click", () => {
              tour.next();
            });
            observer.disconnect();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, []);

  return tour;
}
