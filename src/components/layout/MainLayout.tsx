import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Disclaimer from "../Disclaimer";

export default function MainLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
      <main className="md:ml-64 pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
        <Disclaimer />
      </main>
    </div>
  );
}
