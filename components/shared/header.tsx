import Image from "next/image";
import Link from "next/link";
import { ThemeSwitch } from "./theme/ThemeSwitch";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-700/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-no-bg-dark mode.png"
              alt="Logo"
              width={150}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-md"
              >
                Sign Up
              </Link>
            </nav>
            <ThemeSwitch />
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-200"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
