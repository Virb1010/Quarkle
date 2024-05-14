import { useEditorContext } from "@/src/contexts/editorContext";
import Image from "next/image";

const ldmodeImage = "/images/ldmode.png";

import { Switch } from "@/src/components/ui/switch";

export default function DarkModeButton() {
  const { isLightMode, dispatch } = useEditorContext();

  return (
    <div className="pb-5">
      <div className="flex items-center justify-center space-x-5 self-center rounded-lg">
        <p className="text-lg font-medium text-black dark:text-white">Dark Mode</p>
        <Switch
          onCheckedChange={() => {
            const newLightMode = !isLightMode;
            dispatch({ type: "lightMode/set", payload: newLightMode });
            localStorage.setItem("isLightMode", JSON.stringify(newLightMode));
          }}
          checked={!isLightMode}
          id="dark-mode"
        />
      </div>
    </div>
  );
}
