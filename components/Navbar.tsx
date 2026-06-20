'use client';

import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-[#0f172a] text-slate-200 shadow-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="group flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Herramientas Web Sencillas
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;