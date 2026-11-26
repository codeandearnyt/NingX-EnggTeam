import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ensureBridge } from "./mock";
import "./styles/aqua.css";

const host = document.getElementById("root");
if (!host) throw new Error("#root is missing from index.html");

// In Electron the preload script installs the real bridge first, so this is a
// no-op there. In a browser preview it keeps the UI alive.
ensureBridge();

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
