import Link from "next/link";
import Image from "next/image";
import { useAuth0 } from "@auth0/auth0-react";

import { plumeAPI } from "@/src/helpers/ServiceHelper";

import { putTitle } from "@/src/helpers/dbFunctions";
import { useEditorContext } from "@/src/contexts/editorContext";
import ExportButton from "@/src/components/Buttons/ExportButton";
import { SettingsSheets, SettingsSheetTriggerSubscription } from "@/src/components/Settings/SettingsSheet";
import { updateBookTitleInIndexedDb } from "@/src/helpers/indexedDB";

const logo = "/images/logo_white_large.png";

function ModelTypeButton() {
  return <SettingsSheetTriggerSubscription />;
}

function EditorNavbar({ editor }) {
  const { getAccessTokenSilently } = useAuth0();
  const { bookId, title, dispatch } = useEditorContext();

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    dispatch({ type: "title/set", payload: newTitle });
    updateBookTitleInIndexedDb(newTitle, bookId);
    saveTitle(event.target.value);
  };

  function saveTitle(title) {
    const body = {
      title: title,
    };
    putTitle({ getAccessTokenSilently, bookId, body, plumeAPI, dispatch });
  }

  return (
    <div className="flex w-full justify-center">
      <nav className="relative flex w-[99%] items-center gap-3 rounded-xl border-2 border-[#bebed3] bg-[#f8fafc] px-3 py-2 dark:border-[#35365d] dark:bg-[#070722]">
        <Link href="/" className="flex items-center justify-center gap-2 hover:scale-105 sm:px-10">
          <Image src={logo} alt="Logo" width={55} height={55} className="invert filter dark:invert-0" />
        </Link>

        <div className="absolute left-1/2 w-1/3 -translate-x-1/2 transform bg-transparent sm:w-1/2 ">
          <input
            className="w-full bg-transparent text-center font-montserrat text-2xl font-semibold text-[#14142d]  dark:text-[#f8fafc] sm:px-10 sm:py-4"
            id="Post-Title"
            type="text"
            name="Title"
            placeholder={"Title"}
            onChange={handleTitleChange}
            value={title}
          />
        </div>
        <div className="ml-auto flex w-full justify-end gap-2 text-white sm:gap-5">
          <ExportButton editor={editor} />

          <ModelTypeButton />

          <SettingsSheets />
        </div>
      </nav>
    </div>
  );
}

export default EditorNavbar;
