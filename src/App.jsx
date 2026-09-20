import { Route, Routes } from 'react-router-dom'
import ProtectedRoute, { OnboardingRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Stundenplan from './pages/Stundenplan'
import Hausaufgaben from './pages/Hausaufgaben'
import Pruefungen from './pages/Pruefungen'
import Notizen from './pages/Notizen'
import Bubble from './pages/Bubble'
import Settings from './pages/Settings'
import SettingsSubjects from './pages/SettingsSubjects'
import SettingsNotifications from './pages/SettingsNotifications'
import SettingsApp from './pages/SettingsApp'
import SettingsAccount from './pages/SettingsAccount'
import SettingsUpdates from './pages/SettingsUpdates'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/stundenplan" element={<Stundenplan />} />
          <Route path="/hausaufgaben" element={<Hausaufgaben />} />
          <Route path="/pruefungen" element={<Pruefungen />} />
          <Route path="/notizen" element={<Notizen />} />
          <Route path="/bubble" element={<Bubble />} />
          <Route path="/einstellungen" element={<Settings />} />
          <Route path="/einstellungen/faecher" element={<SettingsSubjects />} />
          <Route path="/einstellungen/benachrichtigungen" element={<SettingsNotifications />} />
          <Route path="/einstellungen/app" element={<SettingsApp />} />
          <Route path="/einstellungen/account" element={<SettingsAccount />} />
          <Route path="/einstellungen/neuigkeiten" element={<SettingsUpdates />} />
        </Route>
      </Route>
    </Routes>
  )
}
