import { useAuth0 } from "@auth0/auth0-react";
import Popup from "reactjs-popup";

const QuarkleImage = "/images/quarkle.png";

function LoginPopup({ setOpen }) {
  const closeModal = () => setOpen(false);
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  return (
    <Popup
      open={!isAuthenticated && !isLoading}
      closeOnDocumentClick={false}
      modal
      className="flex items-center justify-center " // Centers the popup
    >
      <div className="rounded-lg border-2 border-[#bebed3] bg-[#af145f]">
        <div className="relative rounded-lg p-5 text-center text-white">
          <h1 className="text-2xl font-bold">Introduce yourself to Quarkle!</h1>
          <div className="mt-4 flex flex-col items-center">
            <p>Create a free account and meet the best editor in Andromeda!</p>
            <img className="mt-4 h-20 w-20 rounded-full" src={QuarkleImage} alt="Quarkle!" />
          </div>
        </div>
        <div className="flex justify-center gap-4 rounded-b-lg p-3">
          <button
            className="rounded-lg border-2 border-white px-4 py-2 font-semibold text-white transition hover:bg-white hover:bg-opacity-20"
            onClick={() => {
              let redirectUri;
              switch (process.env.NEXT_PUBLIC_ENV) {
                case "development":
                  redirectUri = "http://localhost:3000/studio";
                  break;
                case "staging":
                  redirectUri = "https://www.staging.quarkle.ai/studio";
                  break;
                case "production":
                  redirectUri = "https://www.quarkle.ai/studio";
                  break;
                default:
                  redirectUri = "https://www.quarkle.ai/studio";
              }
              loginWithRedirect({ redirect_uri: redirectUri });
            }}
          >
            Sign Up
          </button>
          <button
            className="rounded-lg border-2 border-white px-4 py-2 font-semibold text-white transition hover:bg-white hover:bg-opacity-20"
            onClick={() => {
              let redirectUri;
              switch (process.env.NEXT_PUBLIC_ENV) {
                case "development":
                  redirectUri = "http://localhost:3000/studio";
                  break;
                case "staging":
                  redirectUri = "https://www.staging.quarkle.ai/studio";
                  break;
                case "production":
                  redirectUri = "https://www.quarkle.ai/studio";
                  break;
                default:
                  redirectUri = "https://www.quarkle.ai/studio";
              }
              loginWithRedirect({ redirect_uri: redirectUri });
            }}
          >
            Log in
          </button>
        </div>
      </div>
    </Popup>
  );
}

export default LoginPopup;
