import { readFile } from "fs/promises";

export interface Config {
  token: string;
}

export default async function getConfig(): Promise<Config> {
  let buffer: Buffer;
  try {
    buffer = await readFile("./golfc-config.json");
  } catch (err) {
    throw new Error('Failed to load "./golfc-config.json".');
  }
  const config = JSON.parse(buffer.toString());
  const token = config.token;
  if (token === undefined || typeof token !== "string") {
    throw new Error('Expected string token in "./golfc-config.json".');
  }
  return {
    token: token,
  };
}
