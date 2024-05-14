"use client";

import Navbar from "@/src/components/Navbar";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handlePayment } from "@/src/helpers/stripe";
import { useEditorContext } from "@/src/contexts/editorContext";

function Pricing() {
  const { user, isAuthenticated, loginWithPopup } = useAuth0();
  const router = useRouter();
  const [isProLoading, setProIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscription } = useEditorContext();
  const [initiatePayment, setInitiatePayment] = useState(false);
  const isPro = subscription.subscription_type === "pro";

  function redirectToStripe() {
    const plan = "pro";
    return handlePayment(plan, user, router, setError, setProIsLoading);
  }

  useEffect(() => {
    if (isAuthenticated && initiatePayment)
      redirectToStripe().then(() => {
        setInitiatePayment(false);
      });
  }, [isAuthenticated, initiatePayment]);

  async function handleProPayment() {
    if (!isAuthenticated) {
      try {
        await loginWithPopup();
      } catch (error) {
        setError(error);
      }
    }
    setInitiatePayment(true); // Indicate that payment process has started
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center self-center bg-gradient-radial-light font-lato text-very-dark-blue dark:bg-gradient-radial-dark-2 dark:text-white">
      <Navbar />
      <div className="my-10 flex h-full w-full flex-col items-center">
        <h1 className="self-center p-4 text-4xl font-semibold text-very-dark-blue dark:text-white">Pricing</h1>
        <h2 className="w-[50%] self-center text-center text-xl text-[#353654] dark:text-[#c6c5ed] ">
          Start your Quarkle journey for free and unlock world-leading editing powers, comprehensive AI assistance, and more with our
          premium plans
        </h2>
        <div className="flex h-full w-[80%] flex-col items-center justify-around space-y-4 py-20 lg:flex-row lg:space-y-0">
          <div className="relative flex min-h-[500px] w-full flex-col items-center justify-around rounded-3xl border border-gray-800 bg-gradient-to-r from-[#fffffc] to-[#e3ded1] px-3 dark:from-very-dark-purple dark:to-very-dark-blue sm:w-[70%] lg:w-[30%]">
            <div className="relative z-10 mt-5 w-full text-center">
              <h3 className="p-2 text-2xl text-very-dark-blue dark:text-[#c6c5ed]">Basic</h3>
              <h2 className="p-2 text-3xl font-bold text-[#353654] dark:text-white">Free for All</h2>
              <div className="mx-auto my-4 w-[70%] border-t border-gray-800"></div>
            </div>
            <ul className="list-none space-y-3 px-2 text-lg font-bold text-black dark:text-white">
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Access to Quarkle Basic Model
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Built on GPT-3.5
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Unlimited Chat
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Unlimited Critique
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Autonomous AI assistance{" "}
              </li>
            </ul>
            {!isAuthenticated && (
              <button
                className="my-4 w-[70%] rounded-xl border bg-very-dark-purple p-2 font-extrabold text-white hover:bg-opacity-90 dark:bg-white dark:text-[#14142d] dark:hover:bg-opacity-90"
                onClick={loginWithPopup}
              >
                Get Started With Free
              </button>
            )}
            {isAuthenticated && !isPro && (
              <div className="border-1 rounded-xl border border-[#14142d] px-3 py-2 font-bold dark:border-white ">
                You're on Quarkle Basic
              </div>
            )}
          </div>
          <div className="relative flex min-h-[500px] w-full flex-col items-center justify-around rounded-3xl border border-gray-800 bg-gradient-to-r from-[#fffffc] to-[#e3ded1] px-3 shadow-red-small dark:from-very-dark-purple dark:to-very-dark-blue dark:shadow-white-small sm:w-[70%] lg:min-h-[600px] lg:w-[30%]">
            <div className="absolute left-0 top-0 m-2 rounded-full bg-very-dark-purple px-2 py-1 text-xs font-bold text-white dark:bg-white dark:text-[#14142d] sm:m-3 sm:px-4 sm:text-sm">
              First Month 75% Off
            </div>{" "}
            <div className="relative z-10 mt-5 w-full text-center">
              <h3 className="p-2 text-2xl text-very-dark-blue dark:text-[#c6c5ed]">Pro</h3>
              <h2 className="p-2 text-3xl font-bold text-[#353654] dark:text-white">
                <del>$19.99</del> $4.99 /mo
              </h2>{" "}
              <div className="mx-auto my-4 w-[70%] border-t border-gray-800"></div>
            </div>
            <ul className="list-none space-y-3 px-2 text-lg font-bold text-black dark:text-white">
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Everything in Quarkle Basic
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Access to Quarkle Pro Model
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Access to Open Expression Mode
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Built on GPT-4
              </li>
              <li>
                <i className="pi pi-check p-1" style={{ fontSize: "1rem" }}></i> Exclusive Pro Features
              </li>
              <li>
                <Link className="italic text-very-dark-blue hover:underline dark:text-[#c6c5ed]" href="/pro">
                  Learn more →
                </Link>
              </li>
            </ul>
            <button
              className="my-4 w-[70%] rounded-xl border bg-very-dark-purple p-2 font-extrabold text-white shadow-red-small  hover:bg-opacity-90 hover:shadow-red-large dark:bg-white dark:text-[#14142d] dark:shadow-white-small dark:hover:bg-opacity-90 dark:hover:shadow-white-large"
              onClick={handleProPayment}
            >
              {!isProLoading && !error && !isPro && <span>Get Quarkle Pro</span>}
              {!isProLoading && !error && isPro && <span>Welcome to Pro</span>}
              {isProLoading && !error && <i className="pi pi-spinner pi-spin"></i>}
              {error && <span className="text-red-500">Error Occurred</span>}
            </button>
          </div>
          <div className="relative flex min-h-[500px] w-full flex-col items-center justify-around rounded-3xl border border-gray-800 bg-gradient-to-r from-[#fffffc] to-[#e3ded1] px-3 dark:from-very-dark-purple dark:to-very-dark-blue sm:w-[70%] lg:w-[30%]">
            <div className="relative z-10 mt-5 w-full text-center">
              <h3 className="p-2 text-2xl text-very-dark-blue dark:text-[#c6c5ed]">Enterprise</h3>
              <h2 className="p-2 text-3xl font-bold text-[#353654] dark:text-white">Let's Chat</h2>
              <div className="mx-auto my-4 w-[70%] border-t border-gray-800"></div>
            </div>
            <span className="my-4 w-[70%] text-center text-lg font-bold">
              Bring that Quarkle Magic ✨ to your own platform! Give your users the ultimate creative partner.
            </span>
            <a
              href="mailto:samarth@quarkle.ai?subject=Contact%20Us"
              className="my-4 inline-block w-[70%] rounded-xl border bg-very-dark-purple p-2 text-center font-extrabold text-white hover:bg-opacity-90 dark:bg-white dark:text-[#14142d] dark:hover:bg-opacity-90"
            >
              Contact Us
            </a>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
