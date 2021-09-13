// node-fetch@3.0.0-beta.9 is required for commonjs imports
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import getConfig from "./getConfig";

export default async function wrappedFetch(
  url: RequestInfo,
  init?: RequestInit
) {
  const config = await getConfig();
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: `__Host-session=${config.token}; __Host-sort=points-asc`,
    },
  });
  if (response.status === 403) {
    throw new Error(
      "Error 403 on fetch request.\n" +
        "Ensure that your token in golfc-config.json is up-to-date."
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Error in a web request to ${url}. Status code ${response.status}.`
    );
  }
  return response;
}
