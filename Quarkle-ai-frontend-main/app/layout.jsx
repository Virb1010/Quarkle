import "@/src/styles/index.css";
import "primeicons/primeicons.css";
import { EditorContextProvider } from "@/src/contexts/editorContext";
import { AiServiceProvider } from "@/src/contexts/aiContext";
import { montserrat, lato } from "@/app/fonts";
import AuthenticationAndAnalytics from "@/src/components/AuthenticationAndAnalytics";
import DarkModeProvider from "@/src/components/DarkModeProvider";
import AuthRedirect from "@/src/components/AuthRedirect";

export const metadata = {
  title: "Quarkle | Your Words Perfected",
  description: "Quarkle | Your Words Perfected",
  keywords: [
    "Quarkle",
    "AI",
    "Editing Services",
    "Studio",
    "Editor",
    "Writing",
    "Writing Tool",
    "Writing Editor",
    "Writing Studio",
    "Writing AI",
    "Self-Publishing",
    "Kindle Direct Publishing",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  creator: "Quarkle",
  publisher: "Quarkle",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lato.variable}`}>
      <body>
        <EditorContextProvider>
          <AuthenticationAndAnalytics>
            <AuthRedirect>
              <DarkModeProvider>
                <AiServiceProvider>
                  <main>{children}</main>
                </AiServiceProvider>
              </DarkModeProvider>
            </AuthRedirect>
          </AuthenticationAndAnalytics>
        </EditorContextProvider>
      </body>
    </html>
  );
}
