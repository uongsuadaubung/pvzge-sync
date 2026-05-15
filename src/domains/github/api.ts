import type { SyncResponse } from "@/shared/types";
import { GistSchema, GistArraySchema } from "@/domains/github/schema";
import type { Gist } from "@/domains/github/schema";
import { SaveDataSchema } from "@/domains/game/schema";
import type { SaveData } from "@/domains/game/schema";
import { GITHUB_API_BASE, GIST_DESCRIPTION, GIST_FILE_NAME } from "@/shared/constants";
import { getGithubToken, getGistId, setGistId } from "@/shared/storage";

/**
 * Hàm hỗ trợ thực hiện request đến GitHub API.
 * Tự động thêm header Authorization và xử lý lỗi HTTP.
 */
async function githubRequest(path: string, options: RequestInit = {}): Promise<unknown> {
  const githubToken = await getGithubToken();
  if (!githubToken) throw new Error("Chưa cấu hình GitHub Token");

  console.debug(`[GitHub API] Requesting: ${path}`, options.method || "GET");

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
    const errMsg = typeof error.message === "string" ? error.message : "GitHub API Error";
    console.error(`[GitHub API] Error ${response.status}:`, errMsg);
    throw new Error(errMsg);
  }

  return response.json();
}

/** Lấy thông tin chi tiết của một Gist theo ID. */
async function getGist(gistId: string): Promise<Gist> {
  const data = await githubRequest(`/gists/${gistId}`);
  return GistSchema.parse(data);
}

/** Cập nhật nội dung file lưu trữ vào Gist hiện có. */
async function updateGist(gistId: string, data: SaveData) {
  console.log("[GitHub API] Updating existing gist:", gistId);
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

/** Tạo một Gist bí mật mới để lưu trữ dữ liệu. */
async function createGist(data: SaveData) {
  console.log("[GitHub API] Creating new secret gist...");
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

/** Tìm kiếm ID của Gist chứa file dữ liệu PVZGE trong tài khoản người dùng. */
async function findGistId(): Promise<string> {
  console.log("[GitHub API] Searching for existing PVZGE gist...");
  const raw = await githubRequest("/gists");
  const gists = GistArraySchema.parse(raw);
  const target = gists.find((g) => GIST_FILE_NAME in g.files);
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
    if (gistId) {
      await updateGist(gistId, data);
    } else {
      const raw = await createGist(data);
      const gist = GistSchema.parse(raw);
      await setGistId(gist.id);
    }
    console.log("[GitHub API] Upload success");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Tải dữ liệu từ GitHub Gist về.
 */
export async function downloadFromGist(): Promise<SyncResponse> {
  try {
    const gistId = await getOrFindGistId();
    if (!gistId) throw new Error("Không tìm thấy bản lưu trên Cloud. Hãy Upload trước.");

    console.log("[GitHub API] Downloading data from gist:", gistId);
    const gist = await getGist(gistId);
    const file = gist.files[GIST_FILE_NAME];
    if (!file) throw new Error("Không tìm thấy file lưu trong Gist.");

    // Xử lý trường hợp content bị cắt (truncate) do file quá lớn
    const content = file.content || await fetch(file.raw_url).then((r) => r.text());
    const raw = JSON.parse(content);
    const data = SaveDataSchema.parse(raw);
    const gistUpdatedAt = new Date(gist.updated_at).getTime();

    console.log("[GitHub API] Download success, updated at:", gist.updated_at);
    return { success: true, data, gistUpdatedAt };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Xác thực Token bằng cách thử gọi API lấy thông tin User. */
async function fetchUserInfo(token: string): Promise<SyncResponse> {
  try {
    console.log("[GitHub API] Validating token...");
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) throw new Error(`Token không hợp lệ (HTTP ${response.status})`);
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

/** API công khai để kiểm tra token. */
export async function validateToken(token: string): Promise<SyncResponse> {
  return fetchUserInfo(token);
}

/** Lấy thông tin người dùng GitHub đang đăng nhập. */
export async function getUserInfo(): Promise<SyncResponse> {
  const token = await getGithubToken();
  if (!token) return { success: false, error: "No token configured" };
  return fetchUserInfo(token);
}
