import { z } from "zod";
import type { SyncResponse } from "@/shared/types.ts";
import {
  GistArraySchema,
  GistSchema,
  GithubUserSchema,
} from "@/domains/github/schema.ts";
import type { Gist } from "@/domains/github/schema.ts";
import { SaveDataSchema } from "@/domains/game/schema.ts";
import type { SaveData } from "@/domains/game/schema.ts";
import {
  GIST_DESCRIPTION,
  GIST_FILE_NAME,
  GITHUB_API_BASE,
} from "@/shared/constants.ts";
import {
  getCachedGithubUser,
  getGistId,
  getGithubToken,
  setCachedGithubUser,
  setGistId,
} from "@/shared/storage.ts";

const GithubErrorSchema = z.object({
  message: z.string().optional(),
});

/**
 * Hàm hỗ trợ thực hiện request đến GitHub API.
 * Tự động thêm header Authorization và xử lý lỗi HTTP.
 */
async function githubRequest(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const githubToken = await getGithubToken();
  if (!githubToken) throw new Error("msg_token_not_configured");

  console.debug(`[GitHub API] Requesting: ${path}`, options.method || "GET");

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Authorization": `token ${githubToken}`,
      "Accept": "application/vnd.github.v3+json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const rawError = await response.json();
    const parsed = GithubErrorSchema.safeParse(rawError);
    const errMsg = parsed.success ? parsed.data.message : "GitHub API Error";
    console.error(`[GitHub API] Error ${response.status}:`, errMsg);
    throw new Error(errMsg || "GitHub API Error");
  }

  return response.json();
}

/** Lấy thông tin chi tiết của một Gist theo ID. */
async function getGist(gistId: string): Promise<Gist> {
  const data = await githubRequest(`/gists/${gistId}`);
  return GistSchema.parse(data);
}

/**
 * Nén đối tượng SaveData thành chuỗi Base64 (sử dụng gzip)
 */
async function compressSaveData(data: SaveData): Promise<string> {
  const jsonString = JSON.stringify(data);
  const byteArray = new TextEncoder().encode(jsonString);
  const stream = new Response(byteArray).body!.pipeThrough(
    new CompressionStream("gzip"),
  );
  const compressedBuffer = await new Response(stream).arrayBuffer();
  const bytes = new Uint8Array(compressedBuffer);

  if (typeof bytes.toBase64 === "function") {
    return bytes.toBase64();
  }
  //fallback old browsers
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Giải nén chuỗi Base64 (gzip) thành đối tượng SaveData
 */
async function decompressSaveData(base64: string): Promise<SaveData> {
  let bytes: Uint8Array;
  if (typeof Uint8Array.fromBase64 === "function") {
    bytes = Uint8Array.fromBase64(base64);
  } else {
    const binary = atob(base64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  }

  if (!(bytes.buffer instanceof ArrayBuffer)) {
    throw new Error("Expected ArrayBuffer");
  }

  const stream = new Blob([bytes.buffer]).stream().pipeThrough(
    new DecompressionStream("gzip"),
  );
  const jsonString = await new Response(stream).text();
  const raw = JSON.parse(jsonString);
  return SaveDataSchema.parse(raw);
}

/**
 * Giải nén hoặc phân tích dữ liệu tải về từ Gist.
 * Hỗ trợ tự động nhận dạng dữ liệu cũ chưa nén (JSON thô) và dữ liệu mới đã nén (gzip + base64).
 */
async function parseGistContent(content: string): Promise<SaveData> {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    const raw = JSON.parse(trimmed);
    return SaveDataSchema.parse(raw);
  }
  return await decompressSaveData(trimmed);
}

/** Cập nhật nội dung file lưu trữ vào Gist hiện có. */
async function updateGist(gistId: string, content: string) {
  console.log("[GitHub API] Updating existing gist:", gistId);
  return await githubRequest(`/gists/${gistId}`, {
    method: "PATCH",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      files: {
        [GIST_FILE_NAME]: {
          content,
        },
      },
    }),
  });
}

/** Tạo một Gist bí mật mới để lưu trữ dữ liệu. */
async function createGist(content: string) {
  console.log("[GitHub API] Creating new secret gist...");
  return await githubRequest("/gists", {
    method: "POST",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILE_NAME]: {
          content,
        },
      },
    }),
  });
}

/** Tìm kiếm ID của Gist chứa file dữ liệu PVZGE trong tài khoản người dùng. */
async function findGistId(): Promise<string> {
  console.log("[GitHub API] Searching for existing PVZGE gist...");
  const raw = await githubRequest("/gists");
  const gists = GistArraySchema.parse(raw);
  const target = gists.find(
    (g) => g.description === GIST_DESCRIPTION && GIST_FILE_NAME in g.files,
  );
  return target ? target.id : "";
}

/** Lấy Gist ID từ bộ nhớ hoặc đi tìm trên GitHub nếu chưa có. */
async function getOrFindGistId(): Promise<string | undefined> {
  let gistId: string | undefined = await getGistId();
  if (!gistId) {
    gistId = await findGistId();
    if (gistId) {
      await setGistId(gistId);
      console.log("[GitHub API] Found and saved gist ID:", gistId);
    }
  }
  return gistId;
}

/**
 * Đẩy dữ liệu lên GitHub Gist.
 * @param data - Dữ liệu save game cần upload.
 */
export async function uploadToGist(data: SaveData): Promise<SyncResponse> {
  try {
    const gistId = await getOrFindGistId();
    const content = await compressSaveData(data);
    if (gistId) {
      await updateGist(gistId, content);
    } else {
      const raw = await createGist(content);
      const gist = GistSchema.parse(raw);
      await setGistId(gist.id);
    }
    console.log("[GitHub API] Upload success");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Tải dữ liệu từ GitHub Gist về.
 */
export async function downloadFromGist(): Promise<SyncResponse> {
  try {
    const gistId = await getOrFindGistId();
    if (!gistId) {
      throw new Error("msg_cloud_save_not_found");
    }

    console.log("[GitHub API] Downloading data from gist:", gistId);
    const gist = await getGist(gistId);
    const file = gist.files[GIST_FILE_NAME];
    if (!file) throw new Error("msg_gist_file_not_found");

    // Xử lý trường hợp content bị cắt (truncate) do file quá lớn
    const content = file.content ||
      await fetch(file.raw_url, { cache: "no-store" }).then((r) => r.text());
    const data = await parseGistContent(content);
    const gistUpdatedAt = new Date(gist.updated_at).getTime();

    console.log("[GitHub API] Download success, updated at:", gist.updated_at);
    return { success: true, data, gistUpdatedAt };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Xác thực Token bằng cách thử gọi API lấy thông tin User. */
async function fetchUserInfo(token: string): Promise<SyncResponse> {
  try {
    console.log("[GitHub API] Validating token...");
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      cache: "no-store",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      throw new Error("token_invalid");
    }
    const raw = await response.json();
    const githubUser = GithubUserSchema.parse(raw);
    return {
      success: true,
      githubUser,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** API công khai để kiểm tra token. */
export async function validateToken(token: string): Promise<SyncResponse> {
  return await fetchUserInfo(token);
}

/** Lấy thông tin người dùng GitHub đang đăng nhập. */
export async function getUserInfo(): Promise<SyncResponse> {
  const token = await getGithubToken();
  if (!token) return { success: false, error: "No token configured" };

  const cached = await getCachedGithubUser();
  if (cached) {
    console.debug("[GitHub API] Returning cached user info:", cached.login);
    return { success: true, githubUser: cached };
  }

  const response = await fetchUserInfo(token);
  if (response.success && "githubUser" in response) {
    await setCachedGithubUser(response.githubUser);
    console.log(
      "[GitHub API] Fetched and cached user info:",
      response.githubUser.login,
    );
  }
  return response;
}

export interface HistoryItem {
  version: string;
  committedAt: string;
  saveData: SaveData | null;
  error?: string;
}

/** Tải danh sách lịch sử sao lưu (5 bản ghi gần nhất) từ Gist. */
export async function fetchGistHistory(): Promise<HistoryItem[]> {
  const gistId = await getOrFindGistId();
  if (!gistId) {
    throw new Error("msg_cloud_save_not_found");
  }

  console.log("[GitHub API] Fetching gist commits for history:", gistId);
  const commitsRaw = await githubRequest(`/gists/${gistId}/commits`);

  const commitsSchema = z.array(
    z.object({
      version: z.string(),
      committed_at: z.string(),
    }),
  );

  const commits = commitsSchema.parse(commitsRaw);

  // Lấy tối đa 5 bản ghi gần nhất theo yêu cầu của người chơi
  const latestCommits = commits.slice(0, 5);

  const items: HistoryItem[] = await Promise.all(
    latestCommits.map(async (commit) => {
      try {
        const detailRaw = await githubRequest(
          `/gists/${gistId}/${commit.version}`,
        );
        const gistDetail = GistSchema.parse(detailRaw);
        const file = gistDetail.files[GIST_FILE_NAME];
        if (!file) {
          return {
            version: commit.version,
            committedAt: commit.committed_at,
            saveData: null,
            error: "msg_gist_file_not_found",
          };
        }

        const content = file.content ||
          await fetch(file.raw_url, { cache: "no-store" }).then((r) => r.text());
        const saveData = await parseGistContent(content);

        return {
          version: commit.version,
          committedAt: commit.committed_at,
          saveData,
        };
      } catch (err: unknown) {
        console.error(
          `[GitHub API] Error fetching history commit ${commit.version}:`,
          err,
        );
        return {
          version: commit.version,
          committedAt: commit.committed_at,
          saveData: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  return items;
}
