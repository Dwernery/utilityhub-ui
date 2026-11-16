import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

// After a deploy, a tab that was already open still asks for the previous build's
// page files, which no longer exist. Reload once to pick up the new build. The
// time check stops a reload loop if a file is genuinely missing.
window.addEventListener("vite:preloadError", (event) => {
  const last = Number(sessionStorage.getItem("chunkReloadAt") ?? 0);
  if (Date.now() - last < 10_000) return; // already reloaded just now: show the error
  sessionStorage.setItem("chunkReloadAt", String(Date.now()));
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")).render(<App />);
