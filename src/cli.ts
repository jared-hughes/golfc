#!/usr/bin/env node

import yargs from "yargs";
import commandFetch from "./commandFetch";
import commandSubmit, { SubmitArgs } from "./commandSubmit";

main();

async function wrapTryCatch(func: Function) {
  try {
    await func();
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
      console.error(
        "The command failed. There is likely additional debugging output above."
      );
    }
  }
}

async function main() {
  let argv: any = await yargs
    .command(
      "fetch",
      "fetch your solutions from code.golf servers",
      (yargs) => yargs,
      () => {
        wrapTryCatch(commandFetch);
      }
    )
    .command(
      "submit <hole> <lang> [scoring]",
      "submit a hole in a specific language",
      (yargs) => {
        yargs
          .positional("hole", {
            describe: "hole to submit",
            type: "string",
          })
          .positional("lang", {
            describe: "language to submit",
            type: "string",
          })
          .positional("scoring", {
            choices: ["bytes", "chars"],
            default: "bytes",
          });
      },
      (argv) => {
        wrapTryCatch(async () => commandSubmit(argv as any as SubmitArgs));
      }
    )
    .demandCommand().argv;
}
