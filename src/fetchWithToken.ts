import * as fs from "fs/promises";

async function getTokenFromDotEnv() {
  try {
    const env = await fs.readFile(".env", { encoding: "utf-8" });
    const lines = env.split("\n");
    const prefix = "CODE_GOLF_TOKEN=";
    const tokenLines = lines.filter((line) => line.startsWith(prefix));
    if (tokenLines.length > 1) {
      console.error("More than one CODE_GOLF_TOKEN in .env. Giving up.");
      process.exit(1);
    }
    if (tokenLines.length == 0) {
      return undefined;
    }
    console.error("Using token from .env.");
    const token = tokenLines[0].slice(prefix.length);
    return token;
  } catch (_) {
    return undefined;
  }
}

export default async function fetchWithToken(url: string, init?: RequestInit) {
  const token =
    (await getTokenFromDotEnv()) ??
    (console.error("Using token from environment"),
    process.env.CODE_GOLF_TOKEN);
  if (token === undefined || token === "") {
    console.error("Your token is empty. Ensure that CODE_GOLF_TOKEN is set.");
    process.exit(1);
  }
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: `__Host-session=${token}; __Host-sort=points-asc`,
    },
  });
  if (response.status === 403) {
    throw new Error(
      "Error 403 on fetch request. Ensure that your token is up-to-date.",
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Error in a web request to ${url}. Status code ${response.status}.`,
    );
  }
  return response;
}

export async function fetchWithoutToken(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status !== 200) {
    throw new Error(
      `Error in a web request to ${url}. Status code ${response.status}.`,
    );
  }
  return response;
}
