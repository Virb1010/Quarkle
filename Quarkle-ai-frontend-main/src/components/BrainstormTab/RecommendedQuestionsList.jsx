import { useEffect, useState } from "react";
import mixpanel from "mixpanel-browser";

export default function RecommendedQuestionsList({
  questionSuggested,
  recommendedQuestions,
  getQuarkleChatResponse,
  setRecommendedQuestions,
}) {
  const [toDelete, setToDelete] = useState([]);

  // If the user has emptied all suggested questions, then reset the questionSuggested flag after timeout
  useEffect(() => {
    if (recommendedQuestions.length === 0 && questionSuggested.current === true) {
      const timer = setTimeout(() => {
        questionSuggested.current = false;
      }, 600000); // 600000 milliseconds = 10 minutes

      return () => clearTimeout(timer); // Cleanup the timeout if the component unmounts or the dependencies change
    }
  }, [recommendedQuestions]);

  // If the user has not clicked on any suggested questions, then empty the recommendedQuestions array after timeout and reset the questionSuggested flag
  useEffect(() => {
    if (recommendedQuestions.length !== 0 && questionSuggested.current === true) {
      const timer = setTimeout(() => {
        recommendedQuestions.forEach((question) => {
          handleDelete(question);
        });

        questionSuggested.current = false;
      }, 600000); // 600000 milliseconds = 10 minutes

      return () => clearTimeout(timer); // Cleanup the timeout if the component unmounts or the dependencies change
    }
  }, [recommendedQuestions]);

  // This effect runs whenever `toDelete` changes.
  useEffect(() => {
    if (toDelete.length > 0) {
      const timeoutId = setTimeout(() => {
        setRecommendedQuestions(recommendedQuestions.filter((q) => !toDelete.includes(q)));
      }, 500); // Set timeout for 500 ms to align with animation

      return () => clearTimeout(timeoutId); // Cleanup the timeout if the component unmounts or the dependencies change
    }
  }, [toDelete]);

  function handleDelete(questionToDelete) {
    setToDelete((prevToDelete) => [...prevToDelete, questionToDelete]);
  }

  return (
    <div className="mt-auto flex w-full flex-col items-center justify-center">
      {recommendedQuestions
        .filter((question) => question) // Filters out empty, null, or undefined questions.
        .map((question) => (
          <div
            className={`relative mb-2.5 w-full animate-fade-in-vigor cursor-pointer rounded-lg border-none bg-[#eaeafd] p-2.5 text-xs 
              font-medium text-[#14142d] transition-colors duration-300 hover:bg-[#c6c5ed] dark:bg-[#982045] dark:text-[#e0e0e0] dark:hover:bg-opacity-70 ${
                toDelete.includes(question) ? "animate-slide-out-left" : ""
              }`}
            key={question}
            onClick={() => {
              mixpanel.track("AI Recommended Questions Clicked");
              document.getElementById("Brainstorm-Input-ID").textContent = question;
              getQuarkleChatResponse();
              setRecommendedQuestions((prevQuestions) => prevQuestions.filter((prevQuestion) => prevQuestion !== question));
            }}
          >
            <div
              className="absolute -right-3 -top-2 z-30 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#fbfaff] bg-[#eaeafd] align-middle hover:bg-[#e5e7eb] dark:border-very-dark-blue dark:bg-[#982045] dark:hover:bg-red-500"
              onClick={(e) => {
                e.stopPropagation(); // This stops the click event from bubbling up to parent elements
                handleDelete(question);
              }}
            >
              <i className="pi pi-times text-xs font-extrabold text-black"></i>
            </div>
            <i>&rarr; {question}</i>
          </div>
        ))}
    </div>
  );
}
