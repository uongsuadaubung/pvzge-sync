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
import { getGistId, getGithubToken, setGistId } from "@/shared/storage.ts";

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

/** Cập nhật nội dung file lưu trữ vào Gist hiện có. */
async function updateGist(gistId: string, data: SaveData) {
  console.log("[GitHub API] Updating existing gist:", gistId);
  return await githubRequest(`/gists/${gistId}`, {
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
  return await githubRequest("/gists", {
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
      await fetch(file.raw_url).then((r) => r.text());
    const raw = JSON.parse(content);
    const data = SaveDataSchema.parse(raw);
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
  return fetchUserInfo(token);
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
          await fetch(file.raw_url).then((r) => r.text());
        const rawData = JSON.parse(content);
        const saveData = SaveDataSchema.parse(rawData);

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
