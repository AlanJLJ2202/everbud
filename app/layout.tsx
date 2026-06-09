import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "🌿 Plant Manager — Gestor de Plantas Personal",
  description: "Gestiona tu jardín personal con identificación por IA",
};

const navLinks = [
  { href: "/plants", label: "Mis Plantas", emoji: "🌿" },
  { href: "/germinations", label: "Germinaciones", emoji: "🌱" },
  { href: "/new-plant", label: "Nueva planta", emoji: "➕" },
  { href: "/cemetery", label: "Cementerio", emoji: "💀" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <span className="font-serif text-xl font-bold text-gray-900">
                  Plant Manager
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:bg-botanical-50 hover:text-botanical-800 transition-colors text-sm font-medium"
                  >
                    <span>{link.emoji}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button className="p-2 rounded-xl text-gray-700 hover:bg-gray-100">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="grid grid-cols-4 gap-1 p-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-700 hover:bg-botanical-50 transition-colors"
                >
                  <span className="text-xl">{link.emoji}</span>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>🌿 Plant Manager — Tu jardín personal con IA</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
