import { execFileSync } from "node:child_process";

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0];
    const result = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", filepath],
      { encoding: "utf8" },
    );
    file.data.astro.frontmatter.lastModified = result.trim();
  };
}
