import Popup from "reactjs-popup";
import { useEditorContext } from "@/src/contexts/editorContext";

export default function DeleteChapterPopup({ open, setOpen, deleteChapter, closeModal }) {
  const { dispatch, chapterId } = useEditorContext();

  return (
    <Popup open={open} closeOnDocumentClick onClose={closeModal}>
      <div className="rounded-lg border-2 border-[#bebed3] bg-[#070724] p-5">
        <div className="flex flex-col items-center justify-center  p-5 text-lg text-white ">
          <i className="pi pi-times absolute right-2 top-2 cursor-pointer rounded-full p-1" onClick={closeModal}></i>
          <h1 className="text-2xl font-bold">Are you sure you want to delete this chapter?</h1>
        </div>
        <div className="flex items-center justify-center gap-5 p-3">
          <button
            className=" cursor-pointer rounded-lg border-2 border-white px-3 font-montserrat text-lg font-semibold text-white hover:opacity-50"
            onClick={() => {
              dispatch({ type: "chapters/delete", payload: chapterId });
              deleteChapter();
            }}
          >
            Yes
          </button>
          <button
            className="cursor-pointer rounded-lg border-2 border-white px-3 font-montserrat text-lg font-semibold text-white hover:opacity-50"
            onClick={() => setOpen(false)}
          >
            No
          </button>
        </div>
      </div>
    </Popup>
  );
}
