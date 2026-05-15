import type { SyncResponse } from "@/shared/types";
import { GistSchema, GistArraySchema } from "@/domains/github/schema";
import type { Gist } from "@/domains/github/schema";
import { SaveDataSchema } from "@/domains/game/schema";
import type { SaveData } from "@/domains/game/schema";
import { GITHUB_API_BASE, GIST_DESCRIPTION, GIST_FILE_NAME } from "@/shared/constants";
import { getGithubToken, getGistId, setGistId } from "@/shared/storage";

async function githubRequest(path: string, options: RequestInit = {}): Promise<unknown> {
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
    const error = await response.json() as { message?: unknown };
    throw new Error(typeof error.message === "string" ? error.message : "GitHub API Error");
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
          content: JSON.stringify(data),
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
          content: JSON.stringify(data),
        },
      },
    }),
  });
}

async function findGistId() {
  const raw = await githubRequest("/gists");
  const gists = GistArraySchema.parse(raw);
  const target = gists.find((g) => GIST_FILE_NAME in g.files);
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

export async function uploadToGist(data: SaveData): Promise<SyncResponse> {
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

export async function downloadFromGist(): Promise<SyncResponse> {
  try {
    const gistId = await getOrFindGistId();
    if (!gistId) throw new Error("Không tìm thấy bản lưu trên Cloud. Hãy Upload trước.");

    const gist = await getGist(gistId);
    const file = gist.files[GIST_FILE_NAME];
    if (!file) throw new Error("Không tìm thấy file lưu trong Gist.");
    // content may be absent for large/truncated files — fall back to raw_url
    const content = file.content || await fetch(file.raw_url).then((r) => r.text());
    const raw = JSON.parse(content);
    const data = SaveDataSchema.parse(raw);
    const gistUpdatedAt = new Date(gist.updated_at).getTime();
    return { success: true, data, gistUpdatedAt };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function fetchUserInfo(token: string): Promise<SyncResponse> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) throw new Error(`Invalid token (HTTP ${response.status})`);
    const raw = await response.json() as Record<string, unknown>;
    return {
      success: true,
      githubUser: {
        login: String(raw.login ?? ""),
        name: raw.name != null ? String(raw.name) : null,
        bio: raw.bio != null ? String(raw.bio) : null,
        avatar_url: String(raw.avatar_url ?? ""),
      },
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function validateToken(token: string): Promise<SyncResponse> {
  return fetchUserInfo(token);
}

export async function getUserInfo(): Promise<SyncResponse> {
  const token = await getGithubToken();
  if (!token) return { success: false, error: "No token configured" };
  return fetchUserInfo(token);
}
