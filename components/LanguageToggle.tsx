'use client'

import { useLanguage } from '@/context/LanguageContext'

// Selector ES/EN. Vive en el nav del layout raíz (logueado vía UserMenu,
// no logueado vía AuthNav), por lo que aparece en todas las pantallas.
export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <button
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className={locale === 'es' ? 'text-botanical-700' : 'text-gray-400'}>ES</span>
      <span className="text-gray-300">|</span>
      <span className={locale === 'en' ? 'text-botanical-700' : 'text-gray-400'}>EN</span>
    </button>
  )
}
