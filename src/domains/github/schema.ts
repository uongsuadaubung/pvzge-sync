import { z } from "zod";

// Used when fetching a specific gist — content may be absent if file is truncated
const GistFileSchema = z.object({
  content: z.string(),
  raw_url: z.string(),
});

// Used when listing gists — GitHub never returns file content in list responses
const GistListFileSchema = z.object({
  raw_url: z.string(),
});

export const GistSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  updated_at: z.string(),
  files: z.record(z.string(), GistFileSchema),
});

const GistListItemSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  files: z.record(z.string(), GistListFileSchema),
});

export const GistArraySchema = z.array(GistListItemSchema);

export const GithubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatar_url: z.string(),
});

export type Gist = z.infer<typeof GistSchema>;
export type GistFile = z.infer<typeof GistFileSchema>;
export type GithubUser = z.infer<typeof GithubUserSchema>;
