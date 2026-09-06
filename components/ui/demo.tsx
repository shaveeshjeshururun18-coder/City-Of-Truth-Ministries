import React from "react";
import { Home, User, Briefcase, FileText } from 'lucide-react';
import { NavBar } from "./tubelight-navbar";

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'About', url: '#', icon: User },
    { name: 'Projects', url: '#', icon: Briefcase },
    { name: 'Resume', url: '#', icon: FileText }
  ];

  return (
    <div className="relative min-h-[200px] w-full flex items-center justify-center p-6 bg-black/90">
      <NavBar items={navItems} />
    </div>
  );
}

export default NavBarDemo;
