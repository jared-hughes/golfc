#!/usr/bin/env node

import yargs from "yargs";
import commandFetch from "./commandFetch";
import commandSubmit from "./commandSubmit";

yargs
  .usage("$0 command")
  .command(commandFetch)
  .command(commandSubmit)
  .strict()
  .demandCommand()
  .help().argv;
