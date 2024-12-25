// node-fetch@3.0.0-beta.9 is required for commonjs imports
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import dotenv from "dotenv";

export default async function fetchWithToken(
  url: RequestInfo,
  init?: RequestInit
) {
  dotenv.config();
  const token = process.env.CODE_GOLF_TOKEN;
  if (token === undefined || token === "")
    throw new Error("Your token is empty. Ensure that CODE_GOLF_TOKEN is set");
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: `__Host-session=${token}; __Host-sort=points-asc`,
    },
  });
  if (response.status === 403) {
    throw new Error(
      "Error 403 on fetch request. Ensure that your token is up-to-date."
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Error in a web request to ${url}. Status code ${response.status}.`
    );
  }
  return response;
}

export async function fetchWithoutToken(url: RequestInfo, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status !== 200) {
    throw new Error(
      `Error in a web request to ${url}. Status code ${response.status}.`
    );
  }
  return response;
}
