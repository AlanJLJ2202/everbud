'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function MobileNav() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  if (loading || !user) return null

  const navLinks = [
    { href: '/plants', label: t('nav.myPlants'), emoji: '🌿' },
    { href: '/germinations', label: t('nav.germinations'), emoji: '🌱' },
    { href: '/new-plant', label: t('nav.newPlant'), emoji: '➕' },
    { href: '/cemetery', label: t('nav.cemetery'), emoji: '💀' },
  ]

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
