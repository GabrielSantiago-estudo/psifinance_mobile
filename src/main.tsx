import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initializeSettings } from "./app/services/settings";
import "./styles/index.css";

initializeSettings();

createRoot(document.getElementById("root")!).render(<App />);
