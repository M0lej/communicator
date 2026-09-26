import { Menu } from "@boxicons/react";
import { useState } from "react";

export default function Home() {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <div className="w-screen h-screen grid grid-cols-[auto_1fr] grid-rows-1">
      <button
        className="fixed left-[10vw] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Menu />
      </button>
      <section
        className={`h-full ${!expanded ? "max-w-0" : ""}  bg-red-400 transition-all`}
      >
        <h1>Test</h1>
      </section>
      <section className="h-full bg-blue-400"></section>
    </div>
  );
}
