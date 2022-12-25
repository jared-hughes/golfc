// node-fetch@3.0.0-beta.9 is required for commonjs imports
import { getHoleID } from "./holeTable";
import { mkdir, writeFile, readFile, rm } from "fs/promises";
import fetchWithToken from "./fetchWithToken";

export default {
  command: "submit",
  describe: "Submit a file to a given hole and language",
  builder: {
    hole: {
      alias: "h",
      describe: "hole to submit",
      type: "string",
    },
    lang: {
      alias: "l",
      describe: "language to submit",
      type: "string",
    },
    input: {
      alias: "i",
      describe: "Input file",
      type: "string",
      demandOption: true,
    },
  },
  handler: (options: any) =>
    commandSubmit(options.hole, options.lang, options.input),
} as const;

async function commandSubmit(hole: string, lang: string, inputFile: string) {
  const holeID = getHoleID(hole);
  console.log(`Submitting hole ${holeID} in language ${lang}...`);
  const code = await readFile(inputFile, { encoding: "utf-8" });
  const response = await submitCode(code, holeID, lang);
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
      update.beat !== null &&
      console.log(
        `${update.scoring}:`,
        `${stringifyRanking(update.from)} → ${stringifyRanking(update.to)}`
      )
  );
}

function stringifyRanking(rank: Ranking) {
  return `${rank.strokes} (#${rank.rank})`;
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
    RankUpdate & { scoring: "bytes" },
    RankUpdate & { scoring: "chars" }
  ];
  Took: number;
}

interface Ranking {
  joint: boolean | null;
  rank: number | null;
  strokes: number | null;
}

interface RankUpdate {
  scoring: string;
  from: Ranking;
  to: Ranking;
  beat: number | null;
}
