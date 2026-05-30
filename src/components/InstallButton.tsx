import { useEffect, useState } from 'react'

/** Event beforeinstallprompt (tidak ada di lib DOM standar). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Tombol "Install Aplikasi" untuk PWA. Muncul hanya bila browser menawarkan
 * pemasangan (Android/Chrome) dan app belum terpasang.
 */
export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    function onInstalled() {
      setHidden(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred || hidden) return null

  return (
    <button
      className="install-btn"
      onClick={async () => {
        await deferred.prompt()
        const choice = await deferred.userChoice
        if (choice.outcome === 'accepted') setHidden(true)
        setDeferred(null)
      }}
    >
      ⬇️ Install Aplikasi
    </button>
  )
}
