// src/main.tsx

import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./app/context/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
