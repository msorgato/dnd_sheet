import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CharacterWizard } from './pages/CharacterWizard'
import { CharacterSheet } from './pages/CharacterSheet'
import { LoginPage } from './pages/LoginPage'
import { LobbiesPage } from './pages/LobbiesPage'
import { LobbyDetailPage } from './pages/LobbyDetailPage'
import { AdminPanel } from './pages/AdminPanel'
import { AccountSettings } from './pages/AccountSettings'
import { useAuthStore } from './store/authStore'
import { useCharacterStore } from './store/characterStore'
import { useDataStore } from './store/dataStore'
import { useLobbyStore } from './store/lobbyStore'
import { useThemeStore } from './store/themeStore'
import { subscribePublishedClasses } from './lib/firestoreSync'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-accent)]">
      <div className="text-4xl">✦</div>
    </div>
  )
}

function App() {
  const { user, isAdmin, loading: authLoading, init } = useAuthStore()
  const { loadFromFirestore: loadChars, clearStore: clearChars } = useCharacterStore()
  const { loadBuiltinData, builtinLoaded, clearStore: clearData } = useDataStore()
  const { clearStore: clearLobbies } = useLobbyStore()
  const theme = useThemeStore((s) => s.theme)
  const [loadedForUid, setLoadedForUid] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadBuiltinData().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      clearChars()
      clearLobbies()
      clearData()
      return
    }
    if (loadedForUid === user.uid) return
    loadChars(user.uid)
      .then(() => setLoadedForUid(user.uid))
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authLoading, loadedForUid])

  useEffect(() => {
    if (authLoading || !user) return
    const unsub = subscribePublishedClasses((classes) => {
      useDataStore.getState().setPublishedCustomClasses(classes)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authLoading])

  const dataLoading = !!user && loadedForUid !== user.uid

  if (authLoading || dataLoading || !builtinLoaded) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/create" element={user ? <CharacterWizard /> : <Navigate to="/login" replace />} />
        <Route path="/character/:id" element={user ? <CharacterSheet /> : <Navigate to="/login" replace />} />
        <Route path="/lobbies" element={user ? <LobbiesPage /> : <Navigate to="/login" replace />} />
        <Route path="/lobbies/:id" element={user ? <LobbyDetailPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={user && isAdmin ? <AdminPanel /> : <Navigate to="/" replace />} />
        <Route path="/settings/account" element={user ? <AccountSettings /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
