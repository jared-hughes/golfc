import getConfig from "./getConfig";
// node-fetch@3.0.0-beta.9 is required for commonjs imports
import fetch from "node-fetch";
import { isLang, getLangExt, getLangName } from "./languageTable";
import { getHoleName, isHole } from "./holeTable";
import { mkdir, writeFile } from "fs/promises";

export default async function commandFetch() {
  const exported = await getExport();
  const deduped = deduplicateSolutions(exported.solutions);
  await Promise.all(deduped.map(applySolution));
}

function deduplicateSolutions(sols: Solution[]) {
  const out: Solution[] = [];
  for (let i = 0; i < sols.length; i++) {
    out.push(sols[i]);
    if (
      sols[i].lang === sols[i + 1]?.lang &&
      sols[i].hole === sols[i + 1]?.hole &&
      sols[i].code === sols[i + 1]?.code &&
      !sols[i].failing
    ) {
      // skip the next sol
      // this should keep the bytes solution and skip the chars solution
      i++;
    }
  }
  return out;
}

async function getExport() {
  const config = await getConfig();
  const response = await fetch("https://code.golf/golfer/export", {
    headers: {
      cookie: `__Host-session=${config.token}; __Host-sort=points-asc`,
    },
    body: null,
    method: "GET",
  });
  if (response.status === 403) {
    throw new Error(
      "Error 403 on fetch request.\n" +
        "Ensure that your token in golfc-config.json is up-to-date."
    );
  }
  if (response.status != 200) {
    throw new Error(
      `Problem fetching your latest sols. Status code ${response.status}.`
    );
  }
  return (await response.json()) as Exported;
}

async function applySolution(sol: Solution) {
  if (!isLang(sol.lang)) {
    console.warn(`Unrecognized language: "${sol.lang}"`);
    return;
  }
  if (!isHole(sol.hole)) {
    console.warn(`Unrecognized hole: "${sol.hole}"`);
    return;
  }
  if (sol.scoring !== "bytes" && sol.scoring !== "chars") {
    console.warn(`Unrecognized scoring: "${sol.scoring}"`);
  }
  const dir = `./${getHoleName(sol.hole)}/${getLangName(sol.lang)}/`;
  const filename = `${dir}/${sol.scoring}.${getLangExt(sol.lang)}`;
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(filename, sol.code);
  } catch {
    console.warn(`Unable to create file "${filename}"`);
  }
}

interface Solution {
  hole: string;
  lang: string;
  scoring: "bytes" | "chars";
  bytes: number;
  chars: number;
  failing: boolean;
  submitted: string;
  code: string;
}

interface Exported {
  name: string;
  country: string;
  time_zone: string;
  cheevos: Array<{
    cheevo: string;
    earned: string;
  }>;
  solutions: Solution[];
}
