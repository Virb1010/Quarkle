import Popup from "reactjs-popup";

export default function DeleteBookPopup({ open, setOpen, deleteBook, closeModal, isLightMode }) {
  const bgClass = isLightMode ? "bg-white" : "bg-[#070724]";
  const textClass = isLightMode ? "text-black" : "text-white";
  const borderClass = isLightMode ? "border-black" : "border-[#bebed3]";

  return (
    <Popup open={open} closeOnDocumentClick onClose={closeModal}>
      <div className={`rounded-lg border-2 ${borderClass} ${bgClass} p-5`}>
        <div className={`flex flex-col items-center justify-center p-5 text-lg ${textClass}`}>
          <i className={`pi pi-times absolute right-2 top-2 cursor-pointer rounded-full p-1 ${textClass}`} onClick={closeModal}></i>
          <h1 className="text-2xl font-bold">Are you sure you want to delete your masterpiece?</h1>
        </div>
        <div className="flex items-center justify-center gap-5 p-3">
          <button
            className={`cursor-pointer rounded-lg border-2 ${borderClass} px-3 font-montserrat text-lg font-semibold ${textClass} hover:opacity-50`}
            onClick={() => deleteBook()}
          >
            Yes
          </button>
          <button
            className={`cursor-pointer rounded-lg border-2 ${borderClass} px-3 font-montserrat text-lg font-semibold ${textClass} hover:opacity-50`}
            onClick={() => setOpen(false)}
          >
            No
          </button>
        </div>
      </div>
    </Popup>
  );
}
