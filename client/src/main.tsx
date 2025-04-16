import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ActivityProvider } from "./contexts/ActivityTracker";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ActivityProvider>
        <App />
      </ActivityProvider>
    </AuthProvider>
  </QueryClientProvider>
);
