// Where the API lives. In production the web app is served from the API's own address,
// so this is empty and requests go to "/api/...". In development, Vite's proxy forwards
// "/api" to the API (see vite.config.js), for the same reason: the session cookie only
// works when the app and the API share an address.
export const API_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "");
