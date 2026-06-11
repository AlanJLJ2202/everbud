'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Profile } from '@/types'

export default function ShareProfileButton() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data)
          setUsernameInput(data.username)
        }
      })
  }, [user])

  if (!profile) return null

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.username}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard puede fallar en contextos no seguros; el input permite copiar manual
    }
  }

  async function handleSaveUsername() {
    const newUsername = usernameInput.trim()
    setError(null)

    if (!/^[A-Za-z0-9_]{3,30}$/.test(newUsername)) {
      setError(t('profile.usernameHint'))
      return
    }
    if (newUsername === profile!.username) return

    setSaving(true)
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', user!.id)
      .select()
      .single()

    setSaving(false)

    if (updateError) {
      setError(t('profile.errorUsername'))
      return
    }
    setProfile(data)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 bg-white border border-botanical-300 text-botanical-700 px-4 py-2 rounded-xl font-semibold hover:bg-botanical-50 transition-colors"
      >
        🔗 {t('profile.share')}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
              🔗 {t('profile.share')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{t('profile.shareDescription')}</p>

            {/* Link + copiar */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                readOnly
                value={profileUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-700"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-botanical-600 text-white rounded-xl font-semibold hover:bg-botanical-700 transition-colors text-sm whitespace-nowrap"
              >
                {copied ? t('profile.copied') : t('profile.copyLink')}
              </button>
            </div>

            {/* Editar username */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.username')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
              />
              <button
                onClick={handleSaveUsername}
                disabled={saving || usernameInput.trim() === profile.username}
                className="px-4 py-2 border border-botanical-300 text-botanical-700 rounded-xl font-semibold hover:bg-botanical-50 transition-colors text-sm disabled:opacity-50"
              >
                {saving ? '...' : t('common.save')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('profile.usernameHint')}</p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
