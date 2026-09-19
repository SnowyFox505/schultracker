import { BubbleIcon, ClockIcon, GridIcon, HomeIcon, NoteIcon, SettingsIcon, TaskIcon } from '../components/navIcons'

export const NAV_ITEMS = [
  { to: '/', label: 'Heute', icon: HomeIcon },
  { to: '/stundenplan', label: 'Plan', icon: GridIcon },
  { to: '/hausaufgaben', label: 'Aufgaben', icon: TaskIcon },
  { to: '/pruefungen', label: 'Tests / Termine', icon: ClockIcon },
  { to: '/notizen', label: 'Notizen', icon: NoteIcon },
  { to: '/bubble', label: 'Bubble', icon: BubbleIcon },
]

export const SETTINGS_ITEM = { to: '/einstellungen', label: 'Einstellungen', icon: SettingsIcon }
