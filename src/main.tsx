import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { preloadUsedAssets } from "./preload-assets";

const render = () =>
  createRoot(document.getElementById("app")!).render(<App />);

render();
requestAnimationFrame(() => void preloadUsedAssets());
