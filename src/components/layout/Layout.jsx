import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AIChatbot from "./AIChatbot";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+33px)]">
        <Outlet />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}