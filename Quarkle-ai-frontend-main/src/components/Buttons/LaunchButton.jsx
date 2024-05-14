"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

export default function LaunchButton() {
  const router = useRouter();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const handleClick = () => {
    if (isAuthenticated) {
      router.push("/studio/editor/0");
    } else {
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
    }
  };
  return (
    <button
      className="m-10 w-fit items-center justify-center rounded-full bg-[#070722] px-10 py-3 text-2xl font-bold text-white shadow-red-small hover:shadow-red-large dark:bg-[#fffffc] dark:text-black dark:shadow-white-small dark:hover:shadow-white-large"
      onClick={handleClick}
    >
      Launch
    </button>
  );
}
