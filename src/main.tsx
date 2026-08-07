import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Auto-reload on stale chunk 404 (happens after fresh deploys when old
// index.html is cached but new hashed JS filenames replace the old ones).
window.addEventListener('vite:preloadError', () => {
    window.location.reload();
});

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
