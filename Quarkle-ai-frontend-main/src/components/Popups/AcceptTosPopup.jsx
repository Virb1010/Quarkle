import Popup from "reactjs-popup";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { setUserAcceptedTerms } from "@/src/helpers/dbFunctions";

export default function AcceptTosPopup({ open, closeModal, dispatch }) {
  const { getAccessTokenSilently } = useAuth0();
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    if (acceptedAge && acceptedTos) {
      try {
        setIsLoading(true);
        const response = await setUserAcceptedTerms({ getAccessTokenSilently, plumeAPI });
        if (response.status == 200) {
          dispatch({ type: "openExpressionAllowed/set", payload: true });
          dispatch({ type: "openExpressionEnabled/set", payload: true });
          closeModal();
        }
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("You must be over 18 and accept the terms of service to proceed.");
    }
  };

  return (
    <Popup open={open} closeOnDocumentClick onClose={closeModal}>
      <div className="rounded-lg border-2 border-[#bebed3] bg-[#070724] p-5">
        <div className="p-5 text-lg text-white ">
          <i className="pi pi-times absolute right-2 top-2 cursor-pointer rounded-full p-1" onClick={closeModal}></i>
          <h1 className="text-2xl font-bold">Confirm Age and Accept Terms</h1>
          <div className="my-4 flex flex-col items-center">
            <p>Are you 18 years old or above?</p>
            <div className="my-2 flex space-x-4">
              <button
                className={`cursor-pointer rounded-lg border-2 px-3 font-montserrat text-lg font-semibold ${
                  acceptedAge ? "bg-green-500" : "border-[#bebed3] text-white hover:opacity-50"
                }`}
                onClick={() => setAcceptedAge(true)}
              >
                Yes
              </button>
              <button
                className={`cursor-pointer rounded-lg border-2 px-3 font-montserrat text-lg font-semibold ${
                  !acceptedAge ? "bg-red-500" : "border-[#bebed3] text-white hover:opacity-50"
                }`}
                onClick={() => setAcceptedAge(false)}
              >
                No
              </button>
            </div>
          </div>
          <div className="my-4 flex flex-col items-center">
            <p>
              Do you accept our{" "}
              <a href="/terms" className="text-blue-500 underline" target="_blank">
                Terms of Service
              </a>
              ?
            </p>
            <div className="my-2 flex space-x-4">
              <button
                className={`cursor-pointer rounded-lg border-2 px-3 font-montserrat text-lg font-semibold ${
                  acceptedTos ? "bg-green-500" : "border-[#bebed3] text-white hover:opacity-50"
                }`}
                onClick={() => setAcceptedTos(true)}
              >
                Yes
              </button>
              <button
                className={`cursor-pointer rounded-lg border-2 px-3 font-montserrat text-lg font-semibold ${
                  !acceptedTos ? "bg-red-500" : "border-[#bebed3] text-white hover:opacity-50"
                }`}
                onClick={() => setAcceptedTos(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="cursor-pointer rounded-lg border-2 border-[#bebed3] px-3 font-montserrat text-lg font-semibold text-white hover:opacity-50"
            onClick={handleAccept}
          >
            Submit
          </button>
        </div>
      </div>
    </Popup>
  );
}
