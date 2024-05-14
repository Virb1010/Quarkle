import mixpanel from "mixpanel-browser";
import { updateConversationChats, convertHtmlToMarkdown, isJSON } from "@/src/helpers/utils";

export default class AiService {
  constructor(featureName) {
    this.featureName = featureName;
    this.connections = {};
  }

  createConnectionKey(keyParams) {
    let key = `AiFeature-${this.featureName}`;
    keyParams.forEach((param) => {
      if (param) key += `-${param}`;
    });
    return key;
  }

  setStreamingStatusChangeCallback(callback) {
    this.onStreamingStatusChange = callback;
  }

  createConnection(keyParams, getAccessTokenSilently, callbacks) {
    const connectionKey = this.createConnectionKey(keyParams);

    // Check if there's already a connection with the same key
    if (this.connections[connectionKey]) {
      console.error("Connection already exists for the given key parameters.");
      return;
    }

    getAccessTokenSilently()
      .then((token) => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WSS_SERVER);
        this.connections[connectionKey] = ws;

        if (callbacks.beforeStart) callbacks.beforeStart();

        ws.onopen = () => {
          if (this.onStreamingStatusChange) this.onStreamingStatusChange(connectionKey, true);

          if (callbacks.onConnectionOpen) callbacks.onConnectionOpen(keyParams, token);
        };

        ws.onmessage = (event) => {
          if (callbacks.onMessage) callbacks.onMessage(event);
        };

        ws.onclose = (event) => {
          if (this.onStreamingStatusChange) this.onStreamingStatusChange(connectionKey, false);

          if (callbacks.onClose) callbacks.onClose(event);
          delete this.connections[connectionKey];
        };

        ws.onerror = (event) => {
          if (callbacks.onError) callbacks.onError(event);
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        };
      })
      .catch((error) => {
        console.error(`Error getting access token for ${this.featureName}:`, error);
        if (callbacks.onError) callbacks.onError(error);
      });
  }

  sendMessage(keyParams, message) {
    const connectionKey = this.createConnectionKey(keyParams);
    const ws = this.connections[connectionKey];
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (typeof message === "object") {
        ws.send(JSON.stringify(message));
      } else {
        ws.send(message);
      }
    } else {
      console.error(`Cannot send message, connection for ${this.featureName} is not open.`);
    }
  }

  closeConnection(keyParams) {
    const connectionKey = this.createConnectionKey(keyParams);
    const ws = this.connections[connectionKey];
    if (ws) {
      ws.close();
    }
  }
}

export class AiChat extends AiService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new AiChat("Brainstorm");
    }
    return this.instance;
  }

  async start(
    getAccessTokenSilently,
    bookId,
    chapterId,
    activeConversation,
    addCommentsToHtml,
    setConversations,
    openExpressionEnabled,
    askUserForPreference,
  ) {
    const keyParams = [bookId, chapterId, activeConversation];

    // Global variables for the WebSocket
    let userResponsePreferance = "";
    let responseType = "chat";
    let commType = "chat";
    const element = document.getElementById("Brainstorm-Input-ID");
    const userInput = convertHtmlToMarkdown(element.innerHTML); // Convert to Markdown cause WSS, Backend, and Chat history is all in Markdown
    this.setConversations = setConversations;

    const beforeStart = () => {
      // To ensure that the chat input empties out properly
      element.removeAttribute("contenteditable");
      element.innerHTML = null;
      element.setAttribute("contenteditable", "true");

      setConversations((prevConversations) =>
        updateConversationChats(prevConversations, activeConversation, { message: userInput, is_user: true }),
      );
      setConversations((prevConversations) =>
        updateConversationChats(prevConversations, activeConversation, { message: "", is_user: false }),
      );
    };

    const onConnectionOpen = (keyParams, token) => {
      mixpanel.track("AI Chat Triggered");
      const initialMessage = {
        action: "Brainstorm",
        data: userInput,
        book_id: bookId,
        chapter_id: chapterId,
        token: token,
        conversation_id: activeConversation,
        open_expression: openExpressionEnabled,
      };
      this.sendMessage(keyParams, initialMessage);
    };

    const onMessage = async (e) => {
      if (e.data.startsWith("//")) {
        commType = e.data.slice(2);

        if (commType === "comments_initiate") {
          responseType = "comments";
          if (!userResponsePreferance || userResponsePreferance === "") {
            userResponsePreferance = await askUserForPreference();
            if (userResponsePreferance === "GIVE_ME_COMMENTS") {
              this.sendMessage(keyParams, "GIVE_ME_COMMENTS");
              setConversations((prevConversations) =>
                updateConversationChats(prevConversations, activeConversation, { message: "Getting Comment..." }, "update"),
              );
            } else if (userResponsePreferance === "GIVE_ME_CHAT") {
              this.sendMessage(keyParams, "GIVE_ME_CHAT");
            }
          }
        } else if (commType === "chat_initiate") {
          responseType = "chat";
        }
        return;
      } else if (isJSON(e.data)) {
        const data = JSON.parse(e.data);
        if (data.type && data.type === "progress_update") {
          const progressMessage = data.message;
          const progressValue = parseInt(data.current_step_completion_limit);
          const estimateTotalTime = data.total_time_estimate;

          if (progressMessage !== "Complete") {
            const message = progressMessage + ". \n \n Will take about " + estimateTotalTime + " seconds.";
            setConversations((prevConversations) =>
              updateConversationChats(prevConversations, activeConversation, { message: message }, "replace"),
            );
          } else {
            setConversations((prevConversations) =>
              updateConversationChats(prevConversations, activeConversation, { message: " " }, "replace"),
            );
          }
          return;
        } else if (data.type && data.type === "error") {
          setConversations((prevConversations) =>
            updateConversationChats(prevConversations, activeConversation, { message: "Whoops, something went wrong." }, "replace"),
          );
          return;
        }
      }

      if (responseType === "chat") {
        setConversations((prevConversations) =>
          updateConversationChats(prevConversations, activeConversation, { message: e.data }, "update"),
        );
      }

      if (responseType === "comments") {
        const data = JSON.parse(e.data);
        addCommentsToHtml(data);
      }
    };

    const onError = (error) => {
      setConversations((prevConversations) =>
        updateConversationChats(prevConversations, activeConversation, { message: `Some error happened` }, "update"),
      );
      console.error(error);
    };

    this.createConnection(keyParams, getAccessTokenSilently, { beforeStart, onConnectionOpen, onMessage, onError });
  }

  closeConnection(keyParams) {
    super.closeConnection(keyParams);
    const activeConversation = keyParams[2];
    // Update chat with a message that the connection is closed
    this.setConversations((prevConversations) =>
      updateConversationChats(prevConversations, activeConversation, { message: "Connection Closed" }, "update"),
    );
  }
}

export class AiComments extends AiService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new AiComments("Comments");
    }
    return this.instance;
  }

  async start(
    getAccessTokenSilently,
    bookId,
    chapterId,
    addCommentsToHtml,
    setCommentsLoadingProgress,
    setCommentsProgressLimit,
    setCommentsLoadingMessage,
    setCommentsEstimateTotalTime,
  ) {
    const keyParams = [bookId, chapterId];

    const onConnectionOpen = (keyParams, token) => {
      mixpanel.track("AI Comments Triggered");
      setCommentsLoadingProgress(0);
      const initialMessage = {
        action: "Comment",
        data: "",
        book_id: bookId,
        chapter_id: chapterId,
        token: token,
      };
      this.sendMessage(keyParams, initialMessage);
    };

    const onMessage = (event) => {
      // Handle the dictionary
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type === "progress_update") {
          const progressMessage = data.message;
          const progressValue = parseInt(data.current_step_completion_limit);
          const estimateTotalTime = data.total_time_estimate;

          setCommentsProgressLimit((prevLimit) => {
            setCommentsLoadingProgress(prevLimit);
            return progressValue;
          });
          setCommentsLoadingMessage(progressMessage);
          setCommentsEstimateTotalTime(estimateTotalTime);
        } else {
          addCommentsToHtml(data);
        }
      } catch (e) {
        console.error("Error parsing JSON data:", e);
      }
    };

    const onClose = () => {
      // Reset the progress bar
      setCommentsLoadingProgress(100);
    };

    const onError = (error) => {
      console.error(error);
      setCommentsLoadingProgress(100);
    };

    this.createConnection(keyParams, getAccessTokenSilently, { onConnectionOpen, onMessage, onClose, onError });
  }
}

export class AiCommentImplementation extends AiService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new AiCommentImplementation("CommentImplementation");
    }
    return this.instance;
  }

  async start(
    getAccessTokenSilently,
    bookId,
    chapterId,
    chapters,
    commentImplementationPackage,
    editor,
    saveData,
    commentId,
    openExpressionEnabled,
    setIsCurrentlyStreaming,
  ) {
    const keyParams = [bookId, chapterId, commentId];
    const comment_range = editor.commands.getCommentTextRange(commentId);
    const start = comment_range.to + 1; // Comments normally end before the fullstop.

    const onConnectionOpen = (keyParams, token) => {
      mixpanel.track("AI Comment Implementation Triggered");
      setIsCurrentlyStreaming(commentId);
      editor.chain().focus(start).insertContent("<br>").run();

      const msg = JSON.stringify({
        action: "ImplementComment",
        data: commentImplementationPackage,
        book_id: bookId,
        chapter_id: chapterId,
        token: token,
        open_expression: openExpressionEnabled,
      });
      this.sendMessage(keyParams, msg); // Send a message to the server
    };

    const onMessage = (e) => {
      if (isJSON(e.data)) {
        // error
        return;
      }

      const msg = `<span style="color: #967BB6; font-style: italic;">${e.data.replace(/(?:\r\n|\r|\n)/g, "<br>")}</span>`;
      editor.commands.insertContent(msg);
    };

    const onClose = (e) => {
      setIsCurrentlyStreaming(null);
      editor.commands.insertContent(`<br>`);
      editor.options.editable = true;
      const end = editor.view.state.selection.from;
      editor.chain().setTextSelection({ from: start, to: end }).setCommentImplementation(commentId).run();
      editor.commands.focus(end);

      saveData(chapters).catch(console.error);
    };

    const onError = (error) => {
      console.error("WebSocket error in CommentImplementation:", error);
      editor.options.editable = true;
    };

    this.createConnection(keyParams, getAccessTokenSilently, { onConnectionOpen, onMessage, onClose, onError });
  }
}

export class AiRecommendedQuestions extends AiService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new AiRecommendedQuestions("RecommendedQuestions");
    }
    return this.instance;
  }

  async start(getAccessTokenSilently, bookId, chapterId, setRecommendedQuestions) {
    const keyParams = [bookId];

    const onConnectionOpen = (keyParams, token) => {
      mixpanel.track("AI Recommended Questions Triggered");
      const initialMessage = {
        action: "RecommendedQuestions",
        data: "",
        book_id: bookId,
        chapter_id: chapterId,
        token: token,
      };
      this.sendMessage(keyParams, initialMessage);
    };

    const onMessage = (event) => {
      if (event.data === null || event.data === undefined) {
        return;
      }
      if (event.data === "//") {
        setRecommendedQuestions((prevQuestions) => [...prevQuestions, ""]);
      } else {
        setRecommendedQuestions((prevQuestions) => {
          const lastQuestionIndex = prevQuestions.length - 1;
          const lastQuestion = prevQuestions[lastQuestionIndex] || "";
          const updatedLastQuestion = lastQuestion + event.data;
          return [...prevQuestions.slice(0, lastQuestionIndex), updatedLastQuestion];
        });
      }
    };

    const onError = (error) => {
      console.error(error);
    };

    this.createConnection(keyParams, getAccessTokenSilently, { onConnectionOpen, onMessage, onError });
  }
}

export class AiToolBar extends AiService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new AiToolBar("ToolBar");
    }
    return this.instance;
  }

  async start(
    action,
    inputText,
    editor,
    getAccessTokenSilently,
    bookId,
    chapterId,
    chapters,
    openExpressionEnabled,
    isAuthenticated,
    saveBook,
  ) {
    const keyParams = [bookId, chapterId, action]; // Include action in keyParams to differentiate between different toolbar actions

    const onConnectionOpen = (keyParams, token) => {
      mixpanel.track(`AI Toolbar Triggered - ${action}`);
      if (inputText === "") {
        alert("Please select some text to " + action);
        return;
      }
      editor.options.editable = false;
      const msg = JSON.stringify({
        action: action,
        data: inputText,
        book_id: bookId,
        chapter_id: chapterId,
        token: token,
        open_expression: openExpressionEnabled,
      });
      this.sendMessage(keyParams, msg);
    };

    const onMessage = (event) => {
      if (isJSON(event.data)) {
        // error
        return;
      }
      const msg = `<span style="color: #967BB6;">${event.data.replace(/(?:\r\n|\r|\n)/g, "<br>")}</span>`;
      editor.commands.insertContent(msg);
    };

    const onClose = () => {
      editor.options.editable = true;
      editor.commands.insertContent(`<br></br>`);

      const saveData = async () => {
        if (isAuthenticated) {
          await saveBook(chapters);
        }
      };
      saveData().catch(console.error);
    };

    const onError = (error) => {
      console.error(error);
      editor.options.editable = true;
    };

    this.createConnection(keyParams, getAccessTokenSilently, { onConnectionOpen, onMessage, onClose, onError });
  }
}

export class AiDetectCategory extends AiService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new AiDetectCategory("DetectCategory");
    }
    return this.instance;
  }

  async start(getAccessTokenSilently, bookId, chapterId, dispatch) {
    const keyParams = [bookId, chapterId];

    const onConnectionOpen = (keyParams, token) => {
      mixpanel.track("AI Detect Category Triggered");
      dispatch({ type: "category/loading/set", payload: true });
      const msg = JSON.stringify({
        action: "DetectCategory",
        book_id: bookId,
        chapter_id: chapterId,
        data: "",
        token: token,
      });
      this.sendMessage(keyParams, msg);
    };

    const onMessage = (event) => {
      dispatch({ type: "category/set", payload: event.data });
    };

    const onError = (error) => {
      console.error("WebSocket error in DetectCategory:", error);
    };

    const onClose = () => {
      dispatch({ type: "category/loading/set", payload: false });
    };

    this.createConnection(keyParams, getAccessTokenSilently, { onConnectionOpen, onMessage, onClose, onError });
  }
}
