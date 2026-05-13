import type { SyncMessage, SyncResponse } from "@/lib/types";
import { GistSchema, GistArraySchema, SaveDataSchema } from "@/lib/schema";
import type { SaveData, Gist } from "@/lib/schema";
import { GITHUB_API_BASE, GIST_DESCRIPTION, GIST_FILE_NAME } from "@/lib/constants";
import { getGithubToken, getGistId, setGistId } from "@/lib/storage";

// GitHub Gist API Helpers
async function githubRequest(path: string, options: RequestInit = {}) {
  const githubToken = await getGithubToken();
  if (!githubToken) throw new Error("Chưa cấu hình GitHub Token");

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `token ${githubToken}`,
      "Accept": "application/vnd.github.v3+json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "GitHub API Error");
  }

  return response.json();
}

async function getGist(gistId: string): Promise<Gist> {
  const data = await githubRequest(`/gists/${gistId}`);
  return GistSchema.parse(data);
}

async function updateGist(gistId: string, data: SaveData) {
  return githubRequest(`/gists/${gistId}`, {
    method: "PATCH",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      files: {
        [GIST_FILE_NAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });
}

async function createGist(data: SaveData) {
  return githubRequest("/gists", {
    method: "POST",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILE_NAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });
}

async function findGistId() {
  const raw = await githubRequest("/gists");
  const gists = GistArraySchema.parse(raw);
  const target = gists.find((g) => g.description === GIST_DESCRIPTION);
  return target ? target.id : undefined;
}

async function getOrFindGistId() {
  let gistId = await getGistId();
  if (!gistId) {
    gistId = await findGistId();
    if (gistId) await setGistId(gistId);
  }
  return gistId;
}

async function uploadToGist(data: SaveData): Promise<SyncResponse> {
  try {
    const gistId = await getOrFindGistId();
    if (gistId) {
      await updateGist(gistId, data);
    } else {
      const raw = await createGist(data);
      const gist = GistSchema.parse(raw);
      await setGistId(gist.id);
    }
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function downloadFromGist(): Promise<SyncResponse> {
  try {
    const gistId = await getOrFindGistId();
    if (!gistId) throw new Error("Không tìm thấy bản lưu trên Cloud. Hãy Upload trước.");

    const gist = await getGist(gistId);
    const file = gist.files[GIST_FILE_NAME];
    if (!file) throw new Error("Không tìm thấy file lưu trong Gist.");
    // content may be absent for large/truncated files — fall back to raw_url
    // const content = file.content ?? await fetch(file.raw_url).then((r) => r.text());
    const data = SaveDataSchema.parse(JSON.parse(file.content));
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

chrome.runtime.onMessage.addListener((message: SyncMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: SyncResponse) => void) => {
  if (message.type === "UPLOAD_TO_GIST") {
    uploadToGist(message.data).then(sendResponse);
    return true;
  } else if (message.type === "DOWNLOAD_FROM_GIST") {
    downloadFromGist().then(sendResponse);
    return true;
  }
  return false;
});
