import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/shell/AppShell'
import { CallbackPage } from '@/auth/CallbackPage'
import { WelcomePage } from '@/auth/WelcomePage'
import { HomePage } from '@/home/HomePage'
import { HouseholdChooserPage } from '@/households/HouseholdChooserPage'
import { InviteClaimPage } from '@/households/InviteClaimPage'
import { SettingsPage } from '@/households/SettingsPage'
import { ListDetailPage, ListsIndexPage } from '@/lists/ListsPages'
import { NoteDetailPage, NotesIndexPage } from '@/notes/NotesPages'
import { PlaceDetailPage, PlacesIndexPage } from '@/places/PlacesPages'
import { SearchPage } from '@/search/SearchPage'
import { ThingDetailPage, ThingsIndexPage } from '@/things/ThingsPages'
import { WatchDetailPage, WatchIndexPage } from '@/watch/WatchPages'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/households" element={<HouseholdChooserPage />} />
        <Route path="/invite/:token" element={<InviteClaimPage />} />
        <Route path="/:householdId" element={<AppShell />}>
          <Route path="home" element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="lists" element={<ListsIndexPage />} />
          <Route path="lists/:listId" element={<ListDetailPage />} />
          <Route path="notes" element={<NotesIndexPage />} />
          <Route path="notes/:noteId" element={<NoteDetailPage />} />
          <Route path="places" element={<PlacesIndexPage />} />
          <Route path="places/:placeEntryId" element={<PlaceDetailPage />} />
          <Route path="watch" element={<WatchIndexPage />} />
          <Route path="watch/:watchEntryId" element={<WatchDetailPage />} />
          <Route path="things" element={<ThingsIndexPage />} />
          <Route path="things/:thingId" element={<ThingDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
