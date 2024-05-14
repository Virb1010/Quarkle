import { useState, useEffect, useCallback } from "react";
import { debounce } from "@/src/helpers/utils";
import { updateBookCategory } from "@/src/helpers/dbFunctions";
import { useEditorContext } from "@/src/contexts/editorContext";

export default function KnowledgeBase({ bookId, getAccessTokenSilently, plumeAPI }) {
  const [inputCategory, setInputCategory] = useState(category);
  const [userHasUpdated, setUserHasUpdated] = useState(false);
  const { dispatch, category, isCategoryLoading } = useEditorContext();

  useEffect(() => {
    if (!userHasUpdated) {
      setInputCategory(category);
      dispatch({ type: "category/loading/set", payload: false });
    }
  }, [category, userHasUpdated]);

  const debouncedUpdate = useCallback(
    debounce((newCategory) => {
      updateBookCategory({ getAccessTokenSilently, bookId, newCategory, plumeAPI });
    }, 1000),
    [getAccessTokenSilently, bookId, plumeAPI],
  );

  const handleInputChange = (event) => {
    setInputCategory(event.target.value);
    dispatch({ type: "category/set", payload: event.target.value });
    debouncedUpdate(event.target.value);
    if (event.target.value.length > 1) {
      setUserHasUpdated(true);
    }
  };

  return (
    <div>
      <div className="text-md rounded-md font-bold dark:text-white">
        <h1 className="py-3 ">Category </h1>
        {isCategoryLoading ? (
          <i className="pi pi-spinner pi-spin"></i>
        ) : (
          <input
            className="ml-2 w-full rounded-md bg-transparent p-2 text-sm font-semibold dark:text-[#fbfaff]"
            value={inputCategory}
            onChange={handleInputChange}
            placeholder={inputCategory === "" ? "Write more to auto-detect" : ""}
            style={inputCategory === "" ? { fontStyle: "italic" } : {}}
          />
        )}
      </div>
    </div>
  );
}
