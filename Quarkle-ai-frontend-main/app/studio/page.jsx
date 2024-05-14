"use client";

import "@/src/styles/Studio.css";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import DOMPurify from "dompurify";
import { useAuth0 } from "@auth0/auth0-react";
import { useEditorContext } from "@/src/contexts/editorContext";

import { plumeAPI } from "@/src/helpers/ServiceHelper";
import Navbar from "@/src/components/Navbar";
import { convertTimetoTimeAgo, encodeBookId } from "@/src/helpers/utils";
import DeleteBookPopup from "@/src/components/Popups/DeleteBookPopup";
import { deleteBookFromIndexedDb } from "@/src/helpers/indexedDB";
import { fetchBooksDataFromDb } from "@/src/helpers/dbFunctions";

const create = "/images/create.png";
const moreIcon = "/images/more.png";
const loading = "/images/logo_white_large.png";

function Studio() {
  const router = useRouter(); // Use useRouter
  const { isAuthenticated, getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();
  const [open, setOpen] = useState(false);
  const [toDelete, setDelete] = useState("");
  const [fadeOutBookId, setFadeOutBookId] = useState(null);
  const { books, isLightMode, isStudioLoading, isStudioLoadingError, isStudioReady, dispatch } = useEditorContext();
  const [allowRedirect, setAllowRedirect] = useState(false);

  useEffect(() => {
    if (books?.length === 0 && isStudioReady && allowRedirect && isAuthenticated && !isAuthLoading) {
      router.push("/studio/editor/0");
    }
  }, [books, isStudioReady, allowRedirect, isAuthenticated, isAuthLoading]);

  const closeModal = () => setOpen(false);

  function deleteBook() {
    closeModal();
    // Add the fade-out class to the book element
    setFadeOutBookId(toDelete);
    deleteBookFromIndexedDb(toDelete);
    // Then, after a delay equal to the animation duration, delete the book
    setTimeout(() => {
      const filteredBooks = books.filter((book) => book.id !== toDelete);
      dispatch({ type: "books/set", payload: filteredBooks });
    }, 500); // This should match the animation-duration in your CSS

    getAccessTokenSilently().then((token) => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      plumeAPI.delete("/books_api/books/" + toDelete, config).then((r) => {
        setOpen(false);
      });
    });
    setDelete("");
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBooksDataFromDb({ getAccessTokenSilently, isAuthenticated, plumeAPI, setAllowRedirect, dispatch });
  }, [isAuthenticated]);

  return (
    <div>
      <div className="min-h-screen bg-gradient-radial-light dark:bg-gradient-radial-dark-2">
        <Navbar />
        <div className="flex w-full flex-col items-center justify-start pt-8">
          <DeleteBookPopup setOpen={setOpen} open={open} deleteBook={deleteBook} closeModal={closeModal} isLightMode={isLightMode} />

          <div className="flex w-10/12 items-center p-3">
            <h1 className="text-3xl font-bold text-black dark:text-[#efeff2]">Books</h1>
            <div
              className="ml-auto flex h-min w-min cursor-pointer items-center justify-center rounded-lg border-2 border-[#c6c5ed] bg-[#e8eaec] px-5 py-1 hover:bg-[#c6c5ed] dark:bg-white dark:hover:bg-[#dcdcdc] sm:py-2"
              onClick={() => {
                const url = `studio/editor/0`;
                router.push(url);
              }}
            >
              <img className="h-8 w-8 p-1 opacity-90 invert filter" src={create} alt="Create a new book"></img>
              <span className="whitespace-nowrap text-xs font-semibold text-black sm:text-base">Create New</span>
            </div>
          </div>
          <div className="Editor-Selection">
            {(isStudioLoading || isAuthLoading) && <img className="loading-gif" src={loading} alt={"Loading"}></img>}
            {books.length === 0 && !isStudioLoading && isStudioLoadingError && !isAuthLoading && (
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-black dark:text-[#efeff2]">
                <i>Woops, it seems like there was an error. Please try again </i>
              </h3>
            )}
            {books.length === 0 && !isStudioLoading && !isAuthenticated && !isAuthLoading && (
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-black dark:text-[#efeff2]">
                <i>Please login to see your projects </i>
              </h3>
            )}
            <ListBooks listBooks={books} fadeOutBookId={fadeOutBookId} setDelete={setDelete} setOpen={setOpen} dispatch={dispatch} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListBooks({ listBooks, fadeOutBookId, setDelete, setOpen, dispatch }) {
  const router = useRouter(); // Use useRouter

  function confirmDelete(book_id) {
    setDelete(book_id);
    setOpen(true);
  }
  return listBooks.map((book) => (
    <div
      className={` mx-auto flex h-5/6 w-72 cursor-pointer flex-col justify-start gap-2.5 rounded-lg border-2 border-[#bebed3] p-4 text-black hover:bg-[#c6c5ed] hover:bg-opacity-50 dark:border-[#20203d] dark:text-white dark:hover:bg-[#20203d] ${
        fadeOutBookId === book.id ? "slide-out-left" : ""
      }`}
      onClick={(event) => {
        const encodedId = encodeBookId(book.id);
        const url = `/studio/editor/${encodedId}`;
        router.push(url);
      }}
      key={book.id}
    >
      <div className="flex items-center">
        <span className="text-sm font-bold">{book.title}</span>
        <img
          className="ml-auto mr-2 h-4 w-4 cursor-pointer opacity-80 invert dark:invert-0"
          src={moreIcon}
          onClick={(event) => {
            event.stopPropagation();
            confirmDelete(book.id);
          }}
          alt="Delete Work"
        ></img>
      </div>
      <span className="mr-4 text-xs font-medium text-gray-500"> Updated {convertTimetoTimeAgo(book.time_updated)} </span>
      <div className="border border-[#bebed3] dark:border-[#20203d]"></div>
      <div
        className=" overflow-hidden whitespace-pre-wrap text-[6px] text-black dark:text-[#efeff2]"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.chapters[0].content) }}
      ></div>
    </div>
  ));
}

export default Studio;
