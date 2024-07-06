// node-fetch@3.0.0-beta.9 is required for commonjs imports
import { getHoleID } from "./holeTable";
import * as fs from "fs/promises";
import fetchWithToken from "./fetchWithToken";
import path from "path";

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

function ns_to_ms_str(n: number): string {
  return `${(n / 1_000_000).toFixed(0)}ms`;
}

async function commandSubmit(hole: string, lang: string, inputFile: string) {
  const holeID = getHoleID(hole);
  console.log(`Submitting hole ${holeID} in language ${lang}...`);
  const code = await fs.readFile(inputFile, { encoding: "utf-8" });
  const response = await submitCode(code, holeID, lang);
  const { rank_updates, runs } = response;
  let pass = runs.every((r) => r.pass);

  if (pass) {
    console.log(
      "Pass :)",
      `in ${runs.map((run) => ns_to_ms_str(run.time_ns)).join(", ")}.`
    );
  } else {
    let all_fail = runs.every((r) => !r.pass);
    console.log(
      "Fail :(",
      `in ${runs
        .map((run) => {
          let s = ns_to_ms_str(run.time_ns);
          if (run.timeout) s += " (timeout)";
          if (!all_fail) s += run.pass ? " (pass)" : " (fail)";
          return s;
        })
        .join(", ")}.`
    );
  }
  // Clear existing `run-` directories
  for (const filename of await fs.readdir("./output")) {
    const match = filename.match(/run-(\d+)/);
    if (!match) continue;
    if (!(parseInt(match[1]) < runs.length)) {
      await fs.rm(path.join("./output", filename), { recursive: true });
    }
  }
  write_run_files("./output", runs[default_run_index(runs)]);
  for (let i = 0; i < runs.length; i++) {
    write_run_files(`./output/run-${i}`, runs[i]);
  }
  console.log(`Wrote response to "./output"`);
  if (pass) {
    logUpdates(rank_updates);
  }
}

function logUpdates(updates: RankUpdate[]) {
  for (const update of updates) {
    let to = update.to.strokes ?? -Infinity;
    let from = update.from.strokes ?? Infinity;
    if (to < from)
      console.log(
        `${update.scoring}:`,
        `${stringifyRanking(update.from)} → ${stringifyRanking(update.to)}`
      );
    else if (to === from) {
      console.log(
        `${update.scoring}:`,
        stringifyRanking(update.to),
        ` (no change)`
      );
    }
  }
}

async function write_run_files(dir: string, run: Run) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // ignore ./output being already present
    if ((err as any)?.code !== "EEXIST") throw err;
  }
  let j = (filename: string) => path.join(dir, filename);
  await fs.writeFile(j("./expected"), run.answer);
  await fs.writeFile(j("./output"), run.stdout);
  await fs.writeFile(j("./errors"), run.stderr);
  const argv = j("./argv");
  if (run.args && run.args.length > 0) {
    await fs.writeFile(argv, run.args.join("\n") + "\n");
  } else {
    try {
      await fs.rm(argv);
    } catch {
      // if we can't delete the file, doesn't really matter
    }
  }
}

// Default run: first failing non-timeout, else first timeout, else last overall.
function default_run_index(runs: Run[]) {
  let i = runs.findIndex((run) => !run.pass && !run.timeout);
  if (i !== -1) return i;
  i = runs.findIndex((run) => !run.pass);
  if (i !== -1) return i;
  return runs.length - 1;
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
  rank_updates: [
    RankUpdate & { scoring: "bytes" },
    RankUpdate & { scoring: "chars" }
  ];
  runs: Run[];
}

interface Run {
  answer: string;
  args: string[];
  exit_code: number;
  pass: boolean;
  stderr: string;
  stdout: string;
  time_ns: number;
  timeout: boolean;
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
}
