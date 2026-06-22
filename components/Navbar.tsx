'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <nav className="bg-[#0f172a] text-slate-200 shadow-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link
            href="/"
            className="group flex items-center space-x-2 min-w-0"
            onClick={() => setMenuAbierto(false)}
          >
            <span className="text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors truncate">
              Herramientas Web Sencillas
            </span>
          </Link>

          {/* Enlace visible solo en pantallas medianas y grandes */}
          <Link
            href="/about"
            className="hidden sm:block text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors shrink-0"
          >
            Acerca de
          </Link>

          {/* Botón de menú hamburguesa, solo visible en móvil */}
          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            className="sm:hidden shrink-0 p-2 -mr-2 text-slate-200 hover:text-blue-400 transition-colors"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Panel desplegable del menú móvil */}
        {menuAbierto && (
          <div className="sm:hidden border-t border-slate-800 py-2">
            <Link
              href="/about"
              onClick={() => setMenuAbierto(false)}
              className="block px-2 py-2.5 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
            >
              Acerca de
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
