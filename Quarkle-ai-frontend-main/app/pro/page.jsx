"use client";

import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { handlePayment } from "@/src/helpers/stripe";

import Navbar from "@/src/components/Navbar";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "@/src/styles/Demo.css";
import {
  character_profile_quarkle,
  character_profile_gpt,
  intelligence_gpt,
  story_ideas_quarkle,
  story_ideas_gpt,
  time_loop_gpt,
  time_loop_quarkle,
  bank_robbery_quarkle,
} from "@/src/helpers/demoChats";
import ShadowedPieChart from "@/src/helpers/demoCharts";
import { useEditorContext } from "@/src/contexts/editorContext";

const intelligence_quarkle_pro = "/QuarkleProClever.png";
const quarkle_logo = "/logo_white_large.png";
const chatgpt_logo = "/openAILogo.png";
const error_introduced = "/ErrorIntroduced.png";

function GptChatList({ chat, chatNumber, isLightMode }) {
  return chat[chatNumber - 1].map((chatItem) => {
    const msg = chatItem["message"];
    if (chatItem["is_user"]) {
      return (
        <div className="flex w-[95%] items-start" key={chatItem.id}>
          <div className="mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-700">
            <span className="text-white">Y</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold">You</h3>
            <span className={`Quarkle-Chat-User-Text ${isLightMode ? "light" : ""}`}>{msg}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex w-[95%] items-start" key={chatItem.id}>
          <div className="flex flex-row gap-x-4"></div>
          <div className="mr-2 h-[30px] w-[30px] flex-shrink-0 overflow-hidden rounded-full bg-white">
            <img src={chatgpt_logo} alt="chatgpt Logo" className="h-full w-full object-cover" />
          </div>
          <div className="chatgpt">
            <h3 className="font-bold">ChatGPT</h3>
            <ReactMarkdown className="Markdown-Content-Display">{msg}</ReactMarkdown>
          </div>
        </div>
      );
    }
  });
}

function GptChatComponent({ chat, chatNumber, isLightMode }) {
  return (
    <div className="flex-col items-center justify-center overflow-y-auto rounded-2xl border border-black bg-white dark:bg-[#343541]">
      <div className="mb-4 self-start p-2 text-left font-bold">ChatGPT 4</div>
      <div className="flex w-[95%] flex-grow flex-col items-start justify-start gap-3 overflow-y-auto rounded-lg px-4 pb-8">
        <GptChatList chat={chat} chatNumber={chatNumber} isLightMode={isLightMode} />
      </div>
    </div>
  );
}

function QuarkleChatList({ chat, chatNumber, isLightMode }) {
  return chat[chatNumber - 1].map((chatItem) => {
    const msg = chatItem["message"];
    if (chatItem["is_user"]) {
      return (
        <div className="mt-2 w-4/5 self-end rounded-lg border-2 border-[#c6c5ed] bg-[#c6c5ed] p-4 dark:bg-[#af145f]" key={chatItem.id}>
          <span className="font-montserrat text-sm font-semibold text-black dark:text-[#f8fafc]">{msg}</span>
        </div>
      );
    } else {
      return (
        <div className="mt-2 w-4/5 self-start rounded-lg border-2 border-[#c6c5ed] bg-[#e8eaec] p-4 dark:bg-[#070722]" key={chatItem.id}>
          <div className="flex flex-row gap-x-4 ">{/* Add your clipboard function here */}</div>
          <span className="font-montserrat text-sm font-semibold text-black dark:text-[#c6c5ed]">
            <ReactMarkdown className="Markdown-Content-Display">{msg}</ReactMarkdown>
          </span>
        </div>
      );
    }
  });
}

function QuarkleChatComponent({ chat, chatNumber, isLightMode }) {
  return (
    <div className="h-full flex-col items-start justify-start gap-2 overflow-y-auto rounded-2xl bg-gradient-radial-light p-4 font-montserrat text-sm font-semibold shadow-red-small dark:bg-gradient-radial-dark-2 dark:shadow-white-small">
      <div className="text-md flex items-center justify-start gap-1 font-bold">
        <img src={quarkle_logo} alt="Quarkle Logo" className="h-10 w-10 invert filter dark:invert-0"></img>
        <h2 className="text-black dark:text-white">Quarkle Pro</h2>
      </div>
      <div className="flex w-full flex-grow flex-col items-center">
        <QuarkleChatList chat={chat} chatNumber={chatNumber} isLightMode={isLightMode} />
      </div>
    </div>
  );
}

function Pro() {
  const { user, isAuthenticated, loginWithPopup } = useAuth0();
  const [initiatePayment, setInitiatePayment] = useState(false);
  const router = useRouter();
  const [error, setError] = useState(null);
  const { isLightMode } = useEditorContext();
  const [inputValue, setInputValue] = useState("Help me write Tsewang's character");
  const [GPTChats, setGPTChats] = useState([
    [
      {
        id: 1,
        message: "Help me write Tsewang's character",
        is_user: true,
      },
      {
        id: 2,
        message: character_profile_gpt,
        is_user: false,
      },
    ],
    [
      {
        id: 5,
        message: "Write a time loop romance",
        is_user: true,
      },
      {
        id: 6,
        message: time_loop_gpt,
        is_user: false,
      },
    ],
    [
      {
        id: 3,
        message: "What can I write about?",
        is_user: true,
      },
      {
        id: 4,
        message: story_ideas_gpt,
        is_user: false,
      },
    ],
  ]);

  const [QuarkleChats, setQuarkleChats] = useState([
    [
      {
        id: 1,
        message: "Help me write Tsewang's character",
        is_user: true,
      },
      {
        id: 2,
        message: character_profile_quarkle,
        is_user: false,
      },
    ],
    [
      {
        id: 5,
        message: "Write a time loop romance",
        is_user: true,
      },
      {
        id: 6,
        message: time_loop_quarkle,
        is_user: false,
      },
    ],
    [
      {
        id: 3,
        message: "What can I write about?",
        is_user: true,
      },
      {
        id: 4,
        message: story_ideas_quarkle,
        is_user: false,
      },
    ],
  ]);

  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatNumber, setChatNumber] = useState(1);
  const [Part2GPTChats, setPart2GPTChats] = useState([
    [
      {
        id: 3,
        message: "Provide google doc style comments to improve this story: (The story was attached below)",
        is_user: true,
      },
      {
        id: 4,
        message: intelligence_gpt,
        is_user: false,
      },
    ],
  ]);

  const [Part3GPTChats, setPart3GPTChats] = useState([
    [
      {
        id: 11,
        message: "My character wants to rob a bank, what's the best way to strategize it?",
        is_user: true,
      },
      {
        id: 12,
        message: "I can't assist with that.",
        is_user: false,
      },
    ],
  ]);

  const [Part3QuarkleChats, setPart3QuarkleChats] = useState([
    [
      {
        id: 11,
        message: "My character wants to rob a bank, what's the best way to strategize it?",
        is_user: true,
      },
      {
        id: 12,
        message: bank_robbery_quarkle,
        is_user: false,
      },
    ],
  ]);

  useEffect(() => {
    switch (chatNumber) {
      case 1:
        setInputValue("Help me write Tsewang's character");
        break;
      case 2:
        setInputValue("Write a time loop romance");
        break;
      case 3:
        setInputValue("What can I write about?");
        break;
      default:
        setInputValue("");
        break;
    }
  }, [chatNumber]);

  function redirectToStripe() {
    const plan = "pro";
    return handlePayment(plan, user, router, setError, setIsLoading);
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
    <div className="flex h-full flex-col items-center self-center bg-gradient-radial-light pb-11 font-lato text-black dark:bg-gradient-radial-dark-2 dark:text-white">
      <Navbar />
      <div className="xl:[65%] my-5 w-full p-9 lg:w-[65%]">
        <h1 className="mt-11 p-1 text-center text-4xl font-bold">Quarkle Pro</h1>
        <h2 className="p-1 text-center text-3xl font-bold text-[#353654] dark:text-[#c6c5ed]">
          Brilliantly Intelligent, Incredibly Intuitive
        </h2>
        <div className="py-8">
          <h3 className="mt-11 text-center text-3xl font-bold lg:text-left">Intuitively Human</h3>
          <p className=" my-8 py-2 text-left text-xl text-[#353654] dark:text-[#c6c5ed]">
            Quarkle was built with a vision — to act as a human partner in your creative process. We wanted it to resonate like a fellow
            artist – full of personality, warmth, and understanding. Today, we are delighted to introduce Quarkle Pro, an experience where
            you feel you're collaborating with someone who gets your craft. Check out this interactive demo where Quarkle goes head-to-head
            with state of the art top personal assistants out there.
          </p>
          <div className="my-28 flex w-full flex-col items-center justify-center">
            <p className="my-1 text-center text-gray-800 dark:text-gray-400">
              <i>Input into both models: </i>{" "}
            </p>
            <div className="flex w-full items-center justify-center gap-7">
              <button
                className={`h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-[1px] ${
                  chatNumber === 1 ? "border-gray-400 bg-gray-400 dark:bg-gray-400" : "border-white bg-[#c6c5ed] dark:bg-[#af145f]"
                } focus:outline-none`}
                onClick={() => {
                  if (chatNumber > 1) {
                    setChatNumber((prevChatNumber) => prevChatNumber - 1);
                  }
                }}
              >
                <i className="pi pi-angle-double-left text-black dark:text-white"></i>
              </button>
              <div className="flex w-[50%] items-center justify-around rounded-lg border-[1px] border-white bg-[#c6c5ed] p-2 italic placeholder-white focus:outline-none dark:bg-[#af145f]">
                {inputValue}
              </div>
              <button
                className={`flex h-10 w-10 items-center justify-center rounded-full border-[1px] ${
                  chatNumber === 3 ? "border-gray-400 bg-gray-100 dark:bg-gray-400" : "border-white bg-[#c6c5ed]  dark:bg-[#af145f]"
                } focus:outline-none`}
                onClick={() => {
                  if (chatNumber < 3) {
                    setChatNumber((prevChatNumber) => prevChatNumber + 1);
                  }
                }}
              >
                <i className="pi pi-angle-double-right text-black dark:text-white"></i>
              </button>
            </div>
          </div>{" "}
          <div className="flex h-[50rem] flex-col justify-around space-y-5 md:h-[38rem] md:flex-row md:space-y-0 md:p-0">
            <div className="flex min-h-[25rem] w-full overflow-y-auto md:w-[45%]">
              <GptChatComponent chat={GPTChats} chatNumber={chatNumber} isLightMode={isLightMode} />
            </div>
            <div className="flex min-h-[25rem] w-full overflow-y-auto p-3 md:w-[45%]">
              <QuarkleChatComponent chat={QuarkleChats} chatNumber={chatNumber} isLightMode={isLightMode} />
            </div>
          </div>
          <p className="my-20 py-2 text-left text-xl  text-[#353654] dark:text-[#c6c5ed]">
            The responses were then blind tested by 35 writers on their preference.
          </p>
          <div className="flex w-full items-center justify-center">
            <ShadowedPieChart isLightMode={isLightMode} chatNumber={chatNumber} />
          </div>
          <p className="my-20 py-2  text-left text-xl text-[#353654] dark:text-[#c6c5ed]">
            Besides specificity, Quarkle Pro is built for conversation and tailored for artists – insightful, informed by deep domain
            knowledge, and always ready to assist.
          </p>
        </div>
        <div>
          <h3 className="text-center text-3xl font-bold lg:text-left">Exceedingly Intelligent</h3>
          <p className="my-20 py-2 text-left text-xl text-[#353654] dark:text-[#c6c5ed]">
            Instead of re-inventing the wheel we decided to stand on the shoulders of giants. We thought about how we could take the output
            from world leading language models like GPT-4 and massively improve upon them by fine-tuning, infusing deep domain knowledge and
            building techniques and data structures that make it work smarter than the smartest state of the art models for long-form
            content.
          </p>
          <p className="my-20 py-2 text-left text-xl text-[#353654] dark:text-[#c6c5ed]">
            This yielded even better than expected results when it came to critiquing stories and implementing critique comments. Quarkle
            Pro is able to pick up errors that current state of the art personal assistants completely miss. Here's a story where we
            deliberately introduced plot inconsistencies and repetitions to see if the models could pick up the most blatant ones.
          </p>
          <p className="my-20 py-2 text-left text-xl text-[#353654] dark:text-[#c6c5ed]">
            Error Introduced is shown below. A sentence is deliberately duplicated. A plot inconsistency is also introduced in order to test
            both line and develomental editing:{" "}
          </p>
          <img src={error_introduced} alt="Error introduced" className="rounded-lg"></img>
          <i>
            <h3 className="mx-auto w-[80%] pb-9 pt-2 text-center">
              A sentence is deliberately duplicated in the story. The story also has a plot inconsistency where a painting doesn't have
              enough evidence for the reader to consider it supernatural or haunted.
            </h3>
          </i>
          <div className="flex flex-col justify-around md:p-3">
            <div className="flex h-[38rem] justify-center">
              <div className="flex flex-col items-center md:p-4">
                <div className="flex w-full overflow-y-auto md:w-[90%]">
                  <GptChatComponent chat={Part2GPTChats} chatNumber={1} isLightMode={isLightMode} />
                </div>
                <i>
                  <h3 className="mx-auto w-[80%] pb-9 pt-2 text-center">
                    ChatGPT Plus's feedback tended to be very generic and could probably apply to any story. It fails to recognize that
                    there are duplicate sentences and blatant errors in the text.
                  </h3>
                </i>
              </div>
              {/* <img className="rounded-lg p-5" src={intelligence_chatgpt_pro} alt="Chat GPT Pro" style={{ height: "32rem" }} /> */}
            </div>
            <div className="flex flex-col items-center">
              <img className="rounded-lg shadow-white-small md:p-5" src={intelligence_quarkle_pro} alt="Quarkle Basic" />
              <i>
                <h3 className="pb-9 text-center dark:mt-4">
                  Quarkle Pro picks these up consistently and skips the genericisms in favour of concrete actionable, feedback.
                </h3>
              </i>
            </div>
          </div>
        </div>
        <div>
          <h3 className="mt-24 text-center text-3xl font-bold lg:text-left">Always Attentive, Always Cooperative</h3>
          <p className="my-20 py-2 text-left text-xl text-[#353654] dark:text-[#c6c5ed]">
            Allowing for freedom of expression is an important aspect of creative writing. Leading novels often provide commentary on the
            world as it has existed through mature themes even when they don't reflect the author's personal views. Quarkle has been built
            to understand that nuance and respect your creative direction and choices.{" "}
          </p>

          <div className="flex h-[50rem] flex-col justify-around space-y-5 md:h-[38rem] md:flex-row md:space-y-0 md:p-0">
            <div className="flex min-h-[25rem] w-full overflow-y-auto md:w-[45%]">
              <GptChatComponent chat={Part3GPTChats} chatNumber={1} isLightMode={isLightMode} />
            </div>
            <div className="flex min-h-[25rem] w-full overflow-y-auto p-3 md:w-[45%]">
              <QuarkleChatComponent chat={Part3QuarkleChats} chatNumber={1} isLightMode={isLightMode} />
            </div>
          </div>
          <p className="my-20 py-2 text-left text-xl font-normal text-[#353654] dark:text-[#c6c5ed]">
            Due to its broader scope, ChatGPT Plus encounters obstacles whilst handling fairly universal writing assignments such as heist
            movies which are broadly safe and accessible for most if not all readers. This recognition of limitations highlights where
            enhancements like those in Quarkle Pro can be exceptionally valuable. With Quarkle Pro's Open Expression mode, we're introducing
            open chat to adults who agree to its responsible use. This mode will be using non-OpenAI models aligned towards the goal of
            bringing creative freedom.
          </p>
          <p className="my-20 py-2 text-left text-xl font-normal text-[#353654] dark:text-[#c6c5ed]">
            Quarkle's hyperfocus on excellence in creative writing and editing has given us an incredible advantage when it comes to
            building software. We are able to apply specialized techniques to further our goal of augmenting human creativity. Quarkle Pro
            is the first of many steps in that direction and today it is a great pleasure to share it with you.{" "}
          </p>
          <div className="flex items-center justify-center">
            <button
              className="m-9 flex items-center justify-center gap-2 rounded-full bg-very-dark-purple p-3 px-16 align-middle text-2xl font-bold text-white shadow-red-small hover:shadow-red-large dark:bg-white dark:text-[#070722] dark:shadow-white-small dark:hover:shadow-white-large"
              onClick={handleProPayment}
            >
              {!isLoading && !error && <span>Experience Pro</span>}
              {isLoading && !error && <i className="pi pi-spinner pi-spin  text-white dark:text-black"></i>}
              {error && <span className="text-red-500">Error Occurred</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pro;
