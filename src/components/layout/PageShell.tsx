import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageShell(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{props.children}</main>
      <Footer />
    </div>
  );
}

