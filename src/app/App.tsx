// src/app/App.tsx

import { Toaster } from "sonner";
import { RouteCentral } from "./routes/index";

export default function App() {
  return (
    <div className="antialiased text-slate-900">
      <RouteCentral />
      <Toaster position="top-right" richColors />
    </div>
  );
}