"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Home,
  FileText,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({
  onCollapse,
}: {
  onCollapse?: (collapsed: boolean) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  const navigationItems = [
    { name: "Home", href: "/authenticated", icon: Home },
    { name: "Templates", href: "/authenticated/template", icon: FileText },
    { name: "Proposals", href: "/authenticated/proposal", icon: FilePlus2 },
  ];

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-700 shadow-lg 
                transition-all duration-300 ease-in-out ${
                  isCollapsed ? "w-20" : "w-64"
                }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex justify-center items-center p-4 border-b border-slate-700">
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ width: isCollapsed ? "100px" : "150px" }}
          >
            <Image
              src={"/logo-no-bg-dark mode.png"}
              alt="Logo"
              width={150}
              height={50}
              className="transition-transform duration-300 ease-in-out"
              style={{
                transform: isCollapsed ? "scale(1)" : "scale(1)",
                transformOrigin: "left center",
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 px-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center py-3 px-4 transition-all duration-300 ease-in-out
                                hover:bg-slate-700/50 text-white/80 
                                ${
                                  isCollapsed
                                    ? "justify-center"
                                    : "justify-start"
                                }`}
            >
              <item.icon
                className={`h-5 w-5 transition-all duration-300 ease-in-out 
                                ${
                                  isCollapsed ? "transform scale-500" : ""
                                }`}
              />
              <span
                className={`ml-3 whitespace-nowrap transition-all duration-300 ease-in-out
                                ${
                                  isCollapsed
                                    ? "opacity-0 w-0 ml-0"
                                    : "opacity-100 w-auto"
                                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-sm hover:bg-slate-700/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-sm text-slate-800">A</span>
            </div>
            <div>
              <p className="text-sm text-slate-200">Admin User</p>
              <p className="text-xs text-slate-400">admin@example.com</p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-slate-900 
                        border border-slate-700 rounded-full p-1.5 
                        hover:bg-slate-700/50 transition-all duration-300 ease-in-out
                        hover:scale-110"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-yellow-400 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-yellow-400 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
