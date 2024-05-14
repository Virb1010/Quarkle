"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";
const googleIcon = "/images/google.png";
export default function GoogleLoginButton() {
  const { loginWithRedirect } = useAuth0();
  return (
    <div
      className="Enter-Email-Container m-10 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#af145f] p-4 text-lg font-bold text-white hover:scale-105 sm:p-5 sm:px-9 sm:text-2xl"
      onClick={loginWithRedirect}
    >
      <Image className="h-16 w-16 sm:h-20 sm:w-20" src={googleIcon} alt="Login with google" width={80} height={80} />
      Get Started With Google
    </div>
  );
}
