import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthNav from "@/components/AuthNav";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "🌿 Everbud — Tu jardín inteligente con IA",
  description: "Gestiona tu jardín personal con identificación por IA, alertas de riego y seguimiento de germinaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('locale');if(l==='en'||l==='es'){document.documentElement.lang=l;return;}var n=navigator.language||'';document.documentElement.lang=n.startsWith('es')?'es':'en';}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-2xl">🌿</span>
                  <span className="font-serif text-xl font-bold text-gray-900">
                    Everbud
                  </span>
                </Link>

                <AuthNav />
              </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
          </nav>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>

          {/* Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
