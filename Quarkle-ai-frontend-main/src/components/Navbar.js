"use client";

import "@/src/styles/index.css";
import "@/src/styles/Navbar.css";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import mixpanel from "mixpanel-browser";
import Image from "next/image";
import { SettingsSheets } from "@/src/components/Settings/SettingsSheet";

const hamburger = "/images/hamburger.png";
const myprojectImg = "/images/projects.png";
const discordImg = "/images/discord-mark-white.png";
const logo = "/images/logo_white_large.png";
const writeImg = "/images/create.png";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  // Track an event. It can be anything, but in this example, we're tracking a Sign Up event.
  mixpanel.track("Sign Up", {
    "Signup Type": "Referral",
  });

  return (
    <div
      className="cursor-pointer rounded-md border-2 border-black p-2 font-montserrat text-xs font-extrabold text-black dark:border-[#fffffc] dark:text-white sm:border-none sm:bg-transparent sm:text-base sm:hover:scale-105"
      onClick={() => loginWithRedirect()}
    >
      Log in
    </div>
  );
};

const AuthenticationButton = () => {
  const { isAuthenticated } = useAuth0();

  return isAuthenticated ? <SettingsSheets /> : <LoginButton />;
};

function SignUpButton({}) {
  const { loginWithRedirect } = useAuth0();

  return (
    <span
      className="hidden cursor-pointer rounded-md border-2 border-black p-2 font-montserrat font-semibold text-black hover:scale-105 dark:border-white dark:text-white sm:block"
      onClick={() => loginWithRedirect()}
    >
      Sign up
    </span>
  );
}

function HamburgerDropdown({ isAuthenticated, user, toggleDropdown }) {
  return (
    <div className="mt-2 flex flex-col rounded-md border-2 border-[#606084] bg-[#fffffc] py-2 text-black dark:bg-[#080828] dark:text-white sm:hidden">
      <HamburgerElement>
        <Link
          className="ml-9 w-full font-bold"
          href="/studio/editor/0"
          onClick={toggleDropdown}
          state={{ email: isAuthenticated ? user.email : null }}
        >
          <i className="pi pi-pencil mr-2 h-6 w-6"></i>
          Write
        </Link>
      </HamburgerElement>
      <HamburgerElement>
        <Link className="ml-9 flex w-full items-center font-bold" onClick={toggleDropdown} href="/studio">
          My Projects
        </Link>
      </HamburgerElement>
      <HamburgerElement>
        <Link className="ml-9 flex w-full items-center font-bold" onClick={toggleDropdown} href="/pricing">
          Pricing
        </Link>
      </HamburgerElement>
      <HamburgerElement>
        <Link className="ml-9 flex w-full items-center font-bold" onClick={toggleDropdown} href="/pro">
          Pro
        </Link>
      </HamburgerElement>
      <HamburgerElement>
        <Link
          href="https://discord.gg/vhxw2Am7tB"
          rel="noopener noreferrer"
          target="_blank"
          onClick={toggleDropdown}
          className="ml-9 flex w-full items-center font-bold"
        >
          <img src={discordImg} id="discord-icon" alt="Discord" className="mr-2 h-5 w-5 invert filter dark:invert-0" /> Discord
        </Link>
      </HamburgerElement>
    </div>
  );
}

function HamburgerElement({ children }) {
  return <div className="hamburger-dropdown-element">{children}</div>;
}

export default function Navbar({ color = "rgba(7, 7, 36, 0.5)" }) {
  // let navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [showDropdown, setDropdown] = useState(false);

  const toggleDropdown = () => {
    setDropdown(!showDropdown);
  };

  return (
    <div className="w-95 sticky top-0 z-50 w-full rounded-md bg-[#fbfaff] bg-opacity-80 p-2 px-3 pt-3 font-montserrat dark:bg-[#070724] sm:px-10">
      <nav className="navbar">
        <img className="h-9 w-9 cursor-pointer sm:hidden" src={hamburger} alt={"menu"} onClick={toggleDropdown}></img>
        <Link href="/" className="flex items-center justify-center gap-2 hover:scale-105">
          <Image src={logo} alt="Logo" width={55} height={55} className="invert filter dark:invert-0" />
          <span className="font-lato text-3xl font-extrabold text-black dark:text-white">Quarkle</span>
        </Link>
        <Link
          className="ml-5 hidden items-center gap-2 font-montserrat text-xs font-semibold text-black hover:scale-105 dark:text-white sm:ml-8 sm:flex sm:text-xl"
          href="/studio"
        >
          My Projects
        </Link>
        <Link
          className="ml-5 hidden items-center gap-2 font-montserrat text-xs font-semibold text-black hover:scale-105 dark:text-white sm:ml-8 sm:flex sm:text-xl"
          href="/pricing"
        >
          Pricing
        </Link>
        <Link
          className="ml-5 hidden items-center gap-2 font-montserrat text-xs font-semibold text-black hover:scale-105 dark:text-white sm:ml-8 sm:flex sm:text-xl"
          href="/pro"
        >
          Pro
        </Link>
        <div className="ml-auto mr-2 flex items-center justify-center gap-5">
          {/* <div className="login-signup-container"> */}
          <a href="https://discord.gg/vhxw2Am7tB" rel="noopener noreferrer" target="_blank" className="hidden sm:block">
            <img src={discordImg} id="discord-icon" alt="Discord" className="mr-1 h-6 w-6 invert filter dark:invert-0" />{" "}
          </a>
          <Link
            className="navbar-options mr-10 invert filter dark:invert-0"
            href="/studio/editor/0"
            state={{ email: isAuthenticated ? user.email : null }}
          >
            <img src={writeImg} alt="Write" className="mr-2 h-6 w-6" />
            Write
          </Link>
          <AuthenticationButton />
          {!isAuthenticated && <SignUpButton />}
        </div>
      </nav>
      {showDropdown && <HamburgerDropdown isAuthenticated={isAuthenticated} user={user} toggleDropdown={toggleDropdown} />}
    </div>
  );
}
