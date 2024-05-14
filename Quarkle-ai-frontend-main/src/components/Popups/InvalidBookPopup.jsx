"use client";

import { useRouter } from "next/navigation";

import Popup from "reactjs-popup";
const QuarkleImage = "/images/quarkle.png";

export function InvalidBookPopup({ open, closeModal }) {
  const router = useRouter();

  return (
    <Popup open={open} onClose={closeModal} closeOnDocumentClick={false}>
      <div className="flex w-full flex-col items-center rounded-lg border-2 border-[#bebed3] bg-[#af145f] p-5">
        <img className="mt-4 h-20 w-20 self-center rounded-full" src={QuarkleImage} alt="Quarkle!" />
        <div className="max-h-52 overflow-y-auto text-xl sm:max-h-[36rem]">
          <div className="flex h-full max-w-3xl flex-col items-center justify-center text-white sm:text-lg">
            The book you are trying to access does not exist.
          </div>
        </div>
        <div className="flex items-center justify-center p-3">
          <button
            className="cursor-pointer rounded-lg border-2 border-white px-3 font-montserrat text-lg font-semibold text-white hover:opacity-50"
            onClick={() => {
              closeModal();
              router.push("/studio");
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </Popup>
  );
}
