import * as path from "path";
import * as fs from "fs";
import simpleGit from "simple-git";
import { z } from "zod";

const BASE_REPO_DIR = "/app/repos"; // Railway persistent directory

if (!fs.existsSync(BASE_REPO_DIR)) {
  fs.mkdirSync(BASE_REPO_DIR, { recursive: true });
}

export const repoToolDef = {
  name: "repo",
  description: "Clone or update a GitHub repository",
  inputSchema: {
    repoUrl: z
      .string()
      .describe("Full git repo URL (e.g. https://github.com/org/repo.git)"),
    branch: z
      .string()
      .optional()
      .default("main")
      .describe("Branch to checkout (default: main)"),
  },
};

export const repoToolHandler = async (
  args: { [x: string]: any },
  extra: any
) => {
  const { repoUrl, branch = "main" } = args;

  try {
    const repoName = path.basename(repoUrl, ".git");
    const repoPath = path.join(BASE_REPO_DIR, repoName);

    const git = simpleGit();

    if (!fs.existsSync(repoPath)) {
      await git.clone(repoUrl, repoPath, ["--branch", branch]);
      return {
        content: [{ type: "text" as const, text: `Cloned into ${repoPath}` }],
      };
    } else {
      const repoGit = simpleGit(repoPath);
      await repoGit.fetch();
      await repoGit.checkout(branch);
      await repoGit.pull("origin", branch);
      return {
        content: [{ type: "text" as const, text: `Updated at ${repoPath}` }],
      };
    }
  } catch (err: any) {
    return {
      content: [
        { type: "text" as const, text: `Git operation failed: ${err.message}` },
      ],
      isError: true,
    };
  }
};
