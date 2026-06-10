'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { href: '/plants', label: 'Mis Plantas', emoji: '🌿' },
  { href: '/germinations', label: 'Germinaciones', emoji: '🌱' },
  { href: '/new-plant', label: 'Nueva planta', emoji: '➕' },
  { href: '/cemetery', label: 'Cementerio', emoji: '💀' },
]

export default function MobileNav() {
  const { user, loading } = useAuth()

  if (loading || !user) return null

  return (
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
  )
}
