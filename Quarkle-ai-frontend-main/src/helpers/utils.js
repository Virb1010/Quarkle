import TurndownService from "turndown";
import crypto from "crypto";

export function convertTimetoTimeAgo(timestamp) {
  const parsedDatetime = new Date(timestamp);
  const currentDatetime = new Date();

  // Get the user's timezone offset in minutes
  const userTimezoneOffset = currentDatetime.getTimezoneOffset();

  // Adjust the currentDatetime by adding the user's timezone offset
  currentDatetime.setMinutes(currentDatetime.getMinutes() + userTimezoneOffset);

  const timeDifference = currentDatetime - parsedDatetime;

  let timeAgo = "";
  if (timeDifference > 365 * 24 * 60 * 60 * 1000) {
    timeAgo = `${Math.floor(timeDifference / (365 * 24 * 60 * 60 * 1000))} years ago`;
  } else if (timeDifference > 24 * 60 * 60 * 1000) {
    timeAgo = `${Math.floor(timeDifference / (24 * 60 * 60 * 1000))} days ago`;
  } else if (timeDifference > 60 * 60 * 1000) {
    timeAgo = `${Math.floor(timeDifference / (60 * 60 * 1000))} hours ago`;
  } else if (timeDifference > 60 * 1000) {
    timeAgo = `${Math.floor(timeDifference / (60 * 1000))} minutes ago`;
  } else {
    timeAgo = "just now";
  }

  return timeAgo;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function humanifyDate(timestamp) {
  // Convert date to Month Day, Year
  const parsedDatetime = new Date(timestamp);
  const year = parsedDatetime.getFullYear();
  const month = parsedDatetime.toLocaleString("default", { month: "long" });
  const day = parsedDatetime.getDate();
  const formattedDate = `${month} ${day}, ${year}`;

  return formattedDate;
}

export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function convertHtmlToMarkdown(html) {
  const turndownService = new TurndownService();
  return turndownService.turndown(html);
}

export function updateConversationChats(prevConversations, activeConversation, newChat, updateType = "new") {
  return prevConversations.map((conversation) => {
    if (conversation.conversation_id === activeConversation) {
      conversation.updated_at = new Date().toISOString();
      const lastChatIndex = conversation.chats.length - 1;

      if (updateType === "update") {
        // Update the last chat message
        const lastChat = conversation.chats[lastChatIndex];
        const updatedLastChat = {
          ...lastChat,
          message: lastChat.message + (newChat.message || ""),
        };
        return {
          ...conversation,
          chats: [...conversation.chats.slice(0, lastChatIndex), updatedLastChat],
        };
      } else if (updateType === "replace") {
        // Replace the last chat message
        return {
          ...conversation,
          chats: [...conversation.chats.slice(0, lastChatIndex), newChat],
        };
      } else if (updateType === "new") {
        // Add a new chat message
        return {
          ...conversation,
          chats: [...conversation.chats, newChat],
        };
      }
    }
    return conversation;
  });
}

export function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const secretSalt = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_SALT;
const secretKey = secretSalt.slice(0, 32);
const iv = Buffer.alloc(16, 0);

export function encodeBookId(bookId) {
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(bookId.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decodeBookId(encodedId) {
  if (encodedId === "0") {
    return "0";
  }
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
    let decrypted = decipher.update(encodedId, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Invalid encodedId: ", error);
    return -99;
  }
}
