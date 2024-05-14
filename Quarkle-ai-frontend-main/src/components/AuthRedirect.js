"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { plumeAPI } from "@/src/helpers/ServiceHelper";
import { useRouter, usePathname } from "next/navigation";
import mixpanel from "mixpanel-browser";
import { useEditorContext } from "@/src/contexts/editorContext";
import { getUserAcceptedTerms, fetchBooksDataFromDb } from "@/src/helpers/dbFunctions";
import { deleteDatabase } from "@/src/helpers/indexedDB";

export default function AuthRedirect({ children }) {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const router = useRouter(); // Use useRouter
  const currentPath = usePathname(); // Get current path
  const { dispatch } = useEditorContext();
  const [isUserSignedUp, setIsUserSignedUp] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        const body = {
          email: user.email,
        };

        try {
          const token = await getAccessTokenSilently();
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };

          // Create user if they don't exist
          const userSignupResponse = await plumeAPI.post(`/users_api/users`, body, config);
          if (userSignupResponse.data) {
            setIsUserSignedUp(true);
          }

          if (currentPath === "/") {
            router.push("/studio");
          }
        } catch (error) {
          mixpanel.track("Signup Error", error);
        }
      };

      fetchUser();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isUserSignedUp) {
      const fetchSubscription = async () => {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        };

        let subscriptionResponse;
        try {
          subscriptionResponse = await plumeAPI.get(`/subscriptions_api/subscriptions/fetch_one`, config);
        } catch (error) {}

        if (subscriptionResponse && subscriptionResponse.data) {
          dispatch({ type: "subscription/set", payload: subscriptionResponse.data });
        }
      };
      fetchSubscription();
    }
  }, [isAuthenticated, getAccessTokenSilently, dispatch, isUserSignedUp]);

  useEffect(() => {
    if (isAuthenticated && isUserSignedUp) {
      async function setUserInfo() {
        const response = await getUserAcceptedTerms({ getAccessTokenSilently, plumeAPI });

        if (response.status === 200) {
          dispatch({ type: "openExpressionAllowed/set", payload: response.data });
        }
      }
      setUserInfo();
    }
  }, [isAuthenticated, getAccessTokenSilently, dispatch, isUserSignedUp]);

  // Always delete database on load to prevent stale data
  useEffect(() => {
    if (!isAuthenticated) return;
    deleteDatabase().then(() => {
      fetchBooksDataFromDb({ getAccessTokenSilently, isAuthenticated, plumeAPI, setAllowRedirect: () => {}, dispatch });
    });
  }, [isAuthenticated]);

  return <>{children}</>;
}
