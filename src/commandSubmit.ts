import { getHoleID } from "./holeTable";
import * as fs from "fs/promises";
import fetchWithToken, { fetchWithoutToken } from "./fetchWithToken";
import path from "path";

export default {
  command: "submit",
  describe:
    "Submit a file to a given hole and language, putting output in the --output directory.",
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
    output: {
      alias: "o",
      describe: "Output directory, or output file if --singleFile is specified",
      type: "string",
      default: "./output",
    },
    auth: {
      alias: "a",
      describe: "Authenticate. Use --no-auth to submit unauthenticated.",
      type: "boolean",
      default: true,
    },
  },
  handler: (options: any) =>
    commandSubmit(
      {
        hole: options.hole,
        lang: options.lang,
        auth: !!options.auth,
        output: options.output,
      },
      options.input
    ),
} as const;

interface SubmitOpts {
  hole: string;
  lang: string;
  auth: boolean;
  output: string;
}

function ns_to_ms_str(n: number): string {
  return `${(n / 1_000_000).toFixed(0)}ms`;
}

async function commandSubmit(opts: SubmitOpts, inputFile: string) {
  const holeID = getHoleID(opts.hole);
  console.log(`Submitting hole ${holeID} in language ${opts.lang}...`);
  const code = await fs.readFile(inputFile, { encoding: "utf-8" });
  const response = await submitCode(code, opts);
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
  await writeIntoOutputDir(opts.output, runs);
  if (pass) {
    logUpdates(rank_updates);
  }
}

async function writeIntoOutputDir(output: string, runs: Run[]) {
  await fs.mkdir(output, { recursive: true });
  // Clear existing `run-` directories
  for (const filename of await fs.readdir(output)) {
    const match = filename.match(/run-(\d+)/);
    if (!match) continue;
    if (!(parseInt(match[1]) < runs.length)) {
      await fs.rm(path.join(output, filename), { recursive: true });
    }
  }
  write_run_files(output, runs[default_run_index(runs)]);
  for (let i = 0; i < runs.length; i++) {
    write_run_files(path.join(output, `run-${i}`), runs[i]);
  }
  console.log(`Wrote response to output`);
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
  await fs.mkdir(dir, { recursive: true });
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

async function submitCode(code: string, opts: SubmitOpts) {
  const url = "https://code.golf/solution";
  const init = {
    body: JSON.stringify({
      Code: code,
      Hole: opts.hole,
      Lang: opts.lang,
    }),
    method: "POST",
  };
  const response = await (opts.auth
    ? fetchWithToken(url, init)
    : fetchWithoutToken(url, init));
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
