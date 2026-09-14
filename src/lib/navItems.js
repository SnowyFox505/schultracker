import { ClockIcon, GridIcon, HomeIcon, NoteIcon, TaskIcon } from '../components/navIcons'

export const NAV_ITEMS = [
  { to: '/', label: 'Heute', icon: HomeIcon },
  { to: '/stundenplan', label: 'Plan', icon: GridIcon },
  { to: '/hausaufgaben', label: 'Aufgaben', icon: TaskIcon },
  { to: '/pruefungen', label: 'Tests', icon: ClockIcon },
  { to: '/notizen', label: 'Notizen', icon: NoteIcon },
]
