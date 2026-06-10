'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-white border-t border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500 mb-2">{t('footer.tagline')}</p>
        <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
          <Link href="/contact" className="hover:text-gray-600 transition-colors">{t('footer.contact')}</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">{t('footer.terms')}</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">{t('footer.privacy')}</Link>
        </div>
      </div>
    </footer>
  )
}
