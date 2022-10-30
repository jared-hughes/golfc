// node-fetch@3.0.0-beta.9 is required for commonjs imports
import { getHoleID } from "./holeTable";
import { mkdir, writeFile, readFile, rm } from "fs/promises";
import fetchWithToken from "./fetchWithToken";

export interface SubmitArgs {
  hole: string;
  lang: string;
  input: string;
}

export default async function commandSubmit(argv: SubmitArgs) {
  const holeID = getHoleID(argv.hole);
  console.log(`Submitting hole ${holeID} in language ${argv.lang}...`);
  const code = await readFile(argv.input, { encoding: "utf-8" });
  const response = await submitCode(code, holeID, argv.lang);
  console.log(
    response.Pass ? "Pass :)" : "Fail :(",
    `in ${(response.Took / 1_000_000).toFixed(0)}ms.`
  );
  if (response.ExitCode !== 0) {
    console.log(`Error: Exit status ${response.ExitCode}`);
  }
  try {
    await mkdir("./output");
  } catch (err) {
    // ignore ./output being already present
    if ((err as any)?.code !== "EEXIST") throw err;
  }
  if (response.Argv && response.Argv.length > 0) {
    await writeFile("./output/argv", response.Argv.join("\n") + "\n");
  } else {
    try {
      await rm("./output/argv");
    } catch {
      // if we can't delete the file, doesn't really matter
    }
  }
  await writeFile("./output/expected", response.Exp);
  await writeFile("./output/output", response.Out);
  console.log(
    `Wrote response to "./output/{${
      response.Argv ? "argv, " : ""
    }expected, output}"`
  );
  response.RankUpdates.forEach(
    (update) =>
      update.Beat !== null &&
      console.log(
        `${update.Scoring}:`,
        `${stringifyRanking(update.From)} → ${stringifyRanking(update.To)}`
      )
  );
}

function stringifyRanking(rank: Ranking) {
  return `${rank.Strokes} (#${rank.Rank})`;
}

async function submitCode(code: string, hole: string, lang: string) {
  const response = await fetchWithToken("https://code.golf/solution", {
    body: JSON.stringify({
      Code: code,
      Hole: hole,
      Lang: lang,
    }),
    method: "POST",
  });
  return (await response.json()) as SolutionResponse;
}

interface SolutionResponse {
  Argv?: string[];
  Exp: string;
  Out: string;
  ExitCode: number;
  Pass: boolean;
  RankUpdates: [
    RankUpdate & { Scoring: "bytes" },
    RankUpdate & { Scoring: "chars" }
  ];
  Took: number;
}

interface Ranking {
  Joint: boolean | null;
  Rank: number | null;
  Strokes: number | null;
}

interface RankUpdate {
  Scoring: string;
  From: Ranking;
  To: Ranking;
  Beat: number | null;
}
