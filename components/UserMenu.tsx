'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const { t, locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      {/* Language Toggle */}
      <button
        onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
        title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <span className={locale === 'es' ? 'text-botanical-700' : 'text-gray-400'}>ES</span>
        <span className="text-gray-300">|</span>
        <span className={locale === 'en' ? 'text-botanical-700' : 'text-gray-400'}>EN</span>
      </button>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-botanical-600 text-white flex items-center justify-center text-sm font-medium">
          {initial}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {displayName}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); signOut() }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
