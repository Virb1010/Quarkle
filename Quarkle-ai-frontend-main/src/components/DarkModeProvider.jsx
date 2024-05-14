"use client";

import { useEffect } from "react";
import { useEditorContext } from "@/src/contexts/editorContext";

export default function DarkModeProvider({ children }) {
  const { isLightMode, dispatch } = useEditorContext();

  useEffect(() => {
    let savedLightModeRaw = localStorage.getItem("isLightMode");
    let savedLightMode = savedLightModeRaw !== null ? JSON.parse(savedLightModeRaw) : "system";

    if (savedLightMode === "system") {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const isMorning = currentHour > 6 || (currentHour === 6 && currentMinute >= 30);
      const isEvening = currentHour < 18 || (currentHour === 18 && currentMinute < 30);
      savedLightMode = isMorning && isEvening;
    }

    dispatch({ type: "lightMode/set", payload: savedLightMode });
  }, []);

  return <div className={`${isLightMode ? "" : "dark"}`}>{children}</div>;
}
