#!/usr/bin/env node

import yargs from "yargs";
import commandFetch from "./commandFetch";

main();

async function main() {
  let argv: any = await yargs.command(
    "fetch",
    "fetch best solutions from code.golf servers",
    async (yargs) => {
      const opts = yargs.argv;
      try {
        await commandFetch();
        console.log("Successful fetch.");
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
  ).argv;

  if (argv._.length < 1) {
    // no command (such as fetch) is given
    yargs.showHelp();
  }
}
