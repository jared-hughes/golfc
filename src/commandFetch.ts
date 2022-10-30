import { getLangExt, getLangName } from "./languageTable";
import { getHoleName } from "./holeTable";
import { mkdir, writeFile } from "fs/promises";
import fetchWithToken from "./fetchWithToken";

export default async function commandFetch() {
  console.log("Fetching solutions...");
  const exported = await getExport();
  const deduped = deduplicateSolutions(exported.solutions);
  await Promise.all(deduped.map(applySolution));
  console.log("Successful fetch.");
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
  const response = await fetchWithToken("https://code.golf/golfer/export", {
    body: null,
    method: "GET",
  });
  return (await response.json()) as Exported;
}

async function applySolution(sol: Solution) {
  if (sol.scoring !== "bytes" && sol.scoring !== "chars") {
    console.warn(`Unrecognized scoring: "${sol.scoring}"`);
  }
  const dir = `./sols/${getHoleName(sol.hole)}/${getLangName(sol.lang)}/`;
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
