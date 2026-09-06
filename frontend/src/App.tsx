import { useState } from "react";
import type { StudentContextValue } from "./components/Header";
import { Assistant } from "./pages/Assistant";
import { ContextSetup } from "./pages/ContextSetup";

export default function App() {
  const [context, setContext] = useState<StudentContextValue | null>(null);

  if (!context) return <ContextSetup onConfirm={setContext} />;
  return <Assistant context={context} onReset={() => setContext(null)} />;
}
