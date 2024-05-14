import { Switch } from "@/src/components/ui/switch";
import AcceptTosPopup from "@/src/components/Popups/AcceptTosPopup";
import { useState } from "react";
import { useEditorContext } from "@/src/contexts/editorContext";
import { Tooltip } from "react-tooltip";

export default function OpenExpressionSwitch() {
  const [openPopup, setOpenPopup] = useState(false);
  const { subscription, openExpressionAllowed, openExpressionEnabled, dispatch } = useEditorContext();
  const isProUser = subscription.subscription_type === "pro";

  async function handleCheckedChange() {
    if (!openExpressionAllowed) {
      setOpenPopup(true);
      return;
    }
    dispatch({ type: "openExpressionEnabled/set", payload: !openExpressionEnabled });
  }

  return (
    <div className="pb-5">
      <div className="flex items-center justify-center space-x-5 self-center rounded-lg">
        <p className="text-lg font-medium text-black dark:text-white">
          {!isProUser && (
            <span>
              <i data-tooltip-id="open-expression-switch" data-tooltip-content="Upgrade to Access" className="pi pi-lock pr-2 text-lg"></i>
            </span>
          )}
          Open Expression Mode
        </p>
        <Switch
          data-tooltip-id="open-expression-switch"
          data-tooltip-content="Upgrade to Access"
          onCheckedChange={handleCheckedChange}
          checked={openExpressionEnabled}
          disabled={!isProUser}
        />
      </div>
      {!isProUser && <Tooltip id="open-expression-switch" />}
      {openPopup && <AcceptTosPopup open={openPopup} closeModal={() => setOpenPopup(false)} dispatch={dispatch} />}
    </div>
  );
}
