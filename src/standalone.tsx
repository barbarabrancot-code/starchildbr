import { createRoot } from "react-dom/client";
import { App } from "./starchild/App";
const root = document.getElementById("root");
if (!root) throw new Error("Starchild mount element missing");
createRoot(root).render(<App />);
