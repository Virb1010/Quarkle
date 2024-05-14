import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

import { humanifyDate } from "@/src/helpers/utils";
import { useEditorContext } from "@/src/contexts/editorContext";

import { SheetItem, SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import { BasicPlan, ProPlan } from "@/src/components/SubscriptionPlans";
import { handlePayment, handleManageAccount } from "@/src/helpers/stripe";

const planComponents = {
  basic: BasicPlan,
  pro: ProPlan,
};
const planOptions = Object.keys(planComponents);

const planCardStyle =
  "flex flex-col w-full items-center border border-[#bebed3] dark:border-[#323354] gap-2 p-5 rounded-lg bg-[#f5f5fa] dark:bg-[#070722]";

export function UpgradeSubscription({ userPlan }) {
  const { user } = useAuth0();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleProPayment() {
    const plan = "pro";
    return handlePayment(plan, user, router, setError, setIsLoading);
  }

  const defaultUpgradePlanCardStyle = `${planCardStyle}`;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {planOptions
        .filter((plan) => plan !== userPlan)
        .map((plan) => {
          const SpecificPlan = planComponents[plan];
          return <SpecificPlan key={plan} className={defaultUpgradePlanCardStyle} onClick={handleProPayment} />;
        })}
      {isLoading && <i className="pi pi-spinner pi-spin text-black dark:text-white"></i>}
      {error && <span className="text-red-500">Error Occurred</span>}
    </div>
  );
}

export default function ManageSubscriptionContent() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscription } = useEditorContext();
  const router = useRouter();
  const userPlan = subscription?.subscription_type;
  const PlanComponent = planComponents[userPlan];

  function handleCustomerPortal() {
    return handleManageAccount(subscription, router, setError, setIsLoading);
  }

  return (
    <SheetHeader>
      <SheetTitle>Manage Subscription</SheetTitle>
      <p className="text-center text-lg font-semibold">Current Subscription</p>
      {!subscription && (
        <div className="flex flex-col items-center justify-center rounded-md border-[#bebed3] bg-[#f5f5fa] p-5 dark:border-[#323354] dark:bg-[#070722]">
          <p className="text-center text-base font-normal">No Active Subscription</p>
        </div>
      )}
      <div className="flex flex-col items-center justify-center">
        <PlanComponent className={planCardStyle} />
        {subscription.stripe_cancel_at_period_end == true && (
          <p className="pt-4 font-light"> Active Until: {humanifyDate(subscription.stripe_current_period_end)}</p>
        )}
      </div>
      <div className="py-5"></div>
      {userPlan === "basic" && (
        <>
          <p className="cursor-pointer text-center text-lg font-semibold" onClick={() => setShowUpgrade((prev) => !prev)}>
            Upgrade Subscription
            <span>
              <i className={`pi ${showUpgrade ? "pi-angle-up" : "pi-angle-down"}`}></i>
            </span>
          </p>
          {showUpgrade && <UpgradeSubscription userPlan={userPlan} />}
        </>
      )}
      <div className="py-5"></div>
      {userPlan !== "basic" && (
        <SheetItem
          onClick={handleCustomerPortal}
          className={`rounded-lg border-2 p-3 hover:border-black hover:bg-[#ededf9] hover:font-bold dark:border-[#323354] dark:hover:border-white dark:hover:bg-[#323354]`}
        >
          {!isLoading && !error && <span>Manage Account</span>}
          {isLoading && !error && <i className="pi pi-spinner pi-spin text-black dark:text-white"></i>}
          {error && <span className="text-red-500">Error Occurred</span>}
        </SheetItem>
      )}
    </SheetHeader>
  );
}
