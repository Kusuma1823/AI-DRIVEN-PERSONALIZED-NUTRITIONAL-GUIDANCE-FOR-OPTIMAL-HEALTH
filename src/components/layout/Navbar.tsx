import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthMenu } from "./AuthMenu";
import { getSession } from "../../features/auth/authStorage";

export function Navbar() {
  const session = useMemo(() => getSession(), []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-chai-100 to-chai-200 text-white shadow-md font-bold text-lg">
            🥗
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-base font-bold text-ink-900">eFresh</div>
            <div className="text-xs text-gray-600 font-medium">Smart Food Choices</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/home" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Dashboard
          </Link>
          <Link to="/recommend" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Foods
          </Link>
          <Link to="/saved-foods" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Saved
          </Link>
          <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Profile
          </Link>
          <Link to="/community" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Community
          </Link>
          <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Contact
          </Link>
          <Link to="/feedback" className="text-sm font-medium text-gray-700 hover:text-chai-100 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            Feedback
          </Link>
          {session?.email === "admin@gmail.com" && (
            <Link to="/admin" className="text-sm font-bold text-chai-100 hover:text-chai-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              ⚙️ Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:block">
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}

