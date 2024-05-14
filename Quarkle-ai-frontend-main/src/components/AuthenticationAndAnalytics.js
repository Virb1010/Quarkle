"use client";

import mixpanel from "mixpanel-browser";
import { Auth0Provider } from "@auth0/auth0-react";
import Script from "next/script";

export default function AuthenticationAndAnalytics({ children }) {
  function getRedirectUri() {
    const env = process.env.NEXT_PUBLIC_ENV;

    switch (env) {
      case "production":
        return "https://www.quarkle.ai/";
      case "staging":
        return "https://staging.quarkle.ai/";
      case "development":
        return "http://localhost:3000/";
      default:
        return "http://localhost:3000/"; // Default to development URI
    }
  }

  mixpanel.init("a155dd5043501198778a9b64e6e5b21a", {
    track_pageview: true,
    persistence: "localStorage",
  });

  return (
    <>
      {process.env.NEXT_PUBLIC_ENV === "production" && (
        <>
          <Script
            type="text/javascript"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "j5fwef15ep");
          `,
            }}
          />
          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WX4GJ2ZT');`,
            }}
          />
        </>
      )}
      <Auth0Provider
        domain={`${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`}
        clientId={`${process.env.NEXT_PUBLIC_CLIENT_ID}`}
        authorizationParams={{
          redirect_uri: getRedirectUri(),
          audience: `${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}`,
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        {children}
      </Auth0Provider>
    </>
  );
}
