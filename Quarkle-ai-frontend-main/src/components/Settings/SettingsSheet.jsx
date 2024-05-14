"use client";

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import mixpanel from "mixpanel-browser";
import { useEditorContext } from "@/src/contexts/editorContext";

import { Sheet, SheetContent, SheetItem, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/src/components/ui/sheet";
import ManageSubscriptionContent from "@/src/components/Settings/ManageSubscriptionContent";
import DarkModeButton from "@/src/components/Buttons/DarkModeButton";
import OpenExpressionSwitch from "@/src/components/Buttons/OpenExpressionSwitch";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  mixpanel.track("Sign Up", {
    "Signup Type": "Referral",
  });

  return (
    <SheetItem className="cursor-pointer" onClick={() => loginWithRedirect()}>
      Log in
    </SheetItem>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <SheetItem className="cursor-pointer" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </SheetItem>
  );
};

function DefaultSettingsContent({ setSelected }) {
  const { user, isAuthenticated } = useAuth0();
  return (
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
      <SheetItem onClick={() => setSelected("manageSubscription")}>Manage Subscription</SheetItem>
      <OpenExpressionSwitch />
      <DarkModeButton />
      {isAuthenticated ? <LogoutButton /> : <LoginButton />}
    </SheetHeader>
  );
}

function SheetContentBody({ selected, setSelected }) {
  return (
    <SheetContent
      selected={selected}
      setSelected={setSelected}
      className="rounded-xl border-2 border-[#323354] bg-gradient-radial-light text-black dark:border-[#323354] dark:bg-gradient-radial-dark dark:text-white"
    >
      {selected === null && <DefaultSettingsContent setSelected={setSelected} />}
      {/* {selected === "userProfile" && <UserProfileContent setSelected={setSelected} />} */}
      {selected === "manageSubscription" && <ManageSubscriptionContent setSelected={setSelected} />}
    </SheetContent>
  );
}

export function SettingsSheets() {
  const [selected, setSelected] = useState(null);

  return (
    <Sheet>
      <SheetTrigger className="mr-4 rounded-md px-2 hover:bg-[#ededf9] dark:hover:bg-[#323354]">
        <i className="pi pi-user text-2xl text-black dark:text-white"></i>
      </SheetTrigger>
      <SheetContentBody selected={selected} setSelected={setSelected} />
    </Sheet>
  );
}

export function SettingsSheetTriggerSubscription() {
  const { subscription } = useEditorContext();
  const [selected, setSelected] = useState("manageSubscription");

  return (
    <Sheet>
      <SheetTrigger className="hidden w-fit items-center justify-center rounded-lg bg-[#070722] px-3 font-bold shadow-red-small hover:shadow-red-large dark:bg-[#fffffc] dark:shadow-white-small dark:hover:shadow-white-large sm:block">
        {subscription.subscription_type === "basic" && (
          <p className="align-middle text-xs text-white dark:text-[#070722] sm:text-base">Go Pro 🚀</p>
        )}
        {subscription.subscription_type === "pro" && (
          <p className="align-middle text-xs text-white dark:text-[#070722] sm:text-base">Using Pro 💫</p>
        )}
      </SheetTrigger>
      <SheetContentBody selected={selected} setSelected={setSelected} />
    </Sheet>
  );
}
