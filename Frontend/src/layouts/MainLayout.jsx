import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  return (
    <div className="light bg-background text-foreground">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
