import type { SyncMessage, SyncResponse } from "@/shared/types";
import { uploadToGist, downloadFromGist, validateToken, getUserInfo } from "@/domains/github/api";

chrome.runtime.onMessage.addListener((message: SyncMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: SyncResponse) => void) => {
  if (message.type === "UPLOAD_TO_GIST") {
    uploadToGist(message.data).then(sendResponse);
    return true;
  } else if (message.type === "DOWNLOAD_FROM_GIST") {
    downloadFromGist().then(sendResponse);
    return true;
  } else if (message.type === "VALIDATE_TOKEN") {
    validateToken(message.token).then(sendResponse);
    return true;
  } else if (message.type === "GET_USER_INFO") {
    getUserInfo().then(sendResponse);
    return true;
  }
  return false;
});
