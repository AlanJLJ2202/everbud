'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import UserMenu from './UserMenu'

const navLinks = [
  { href: '/plants', label: 'Mis Plantas', emoji: '🌿' },
  { href: '/germinations', label: 'Germinaciones', emoji: '🌱' },
  { href: '/new-plant', label: 'Nueva planta', emoji: '➕' },
  { href: '/cemetery', label: 'Cementerio', emoji: '💀' },
]

export default function AuthNav() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <Link
        href="/login"
        className="bg-botanical-600 hover:bg-botanical-700 text-white font-medium py-2 px-5 rounded-xl transition-colors text-sm"
      >
        Iniciar sesión
      </Link>
    )
  }

  return (
    <>
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

      <UserMenu />
    </>
  )
}
