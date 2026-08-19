import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import "@/styles/globals.css";

import App from "@/app";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" tidak ditemukan.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
