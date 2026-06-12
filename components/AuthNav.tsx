'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import UserMenu from './UserMenu'
import LanguageToggle from './LanguageToggle'

export default function AuthNav() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) return null

  const navLinks = [
    { href: '/plants', label: t('nav.myPlants'), emoji: '🌿' },
    { href: '/germinations', label: t('nav.germinations'), emoji: '🌱' },
    { href: '/new-plant', label: t('nav.newPlant'), emoji: '➕' },
    { href: '/cemetery', label: t('nav.cemetery'), emoji: '💀' },
  ]

  if (!user) {
    // Sin sesión (landing, login, register, perfiles públicos) el selector de
    // idioma debe seguir disponible: aquí vive fuera de UserMenu
    return (
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Link
          href="/login"
          className="bg-botanical-600 hover:bg-botanical-700 text-white font-medium py-2 px-5 rounded-xl transition-colors text-sm"
        >
          {t('nav.login')}
        </Link>
      </div>
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
