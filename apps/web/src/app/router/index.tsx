import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
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
import { PrototypeProvider } from '@/prototype/PrototypeProvider'
import { SearchPage } from '@/search/SearchPage'
import { ThingDetailPage, ThingsIndexPage } from '@/things/ThingsPages'
import { WatchDetailPage, WatchIndexPage } from '@/watch/WatchPages'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/welcome" replace /> },
  { path: '/welcome', element: <WelcomePage /> },
  { path: '/auth/callback', element: <CallbackPage /> },
  { path: '/households', element: <HouseholdChooserPage /> },
  { path: '/invite/:token', element: <InviteClaimPage /> },
  {
    path: '/:householdId',
    element: <AppShell />,
    children: [
      { path: 'home', element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'lists', element: <ListsIndexPage /> },
      { path: 'lists/:listId', element: <ListDetailPage /> },
      { path: 'notes', element: <NotesIndexPage /> },
      { path: 'notes/:noteId', element: <NoteDetailPage /> },
      { path: 'places', element: <PlacesIndexPage /> },
      { path: 'places/:placeEntryId', element: <PlaceDetailPage /> },
      { path: 'watch', element: <WatchIndexPage /> },
      { path: 'watch/:watchEntryId', element: <WatchDetailPage /> },
      { path: 'things', element: <ThingsIndexPage /> },
      { path: 'things/:thingId', element: <ThingDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export function AppRouter() {
  return (
    <PrototypeProvider>
      <RouterProvider router={router} />
    </PrototypeProvider>
  )
}
