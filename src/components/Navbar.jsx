import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const linkBase = 'px-3 py-2 rounded-md text-sm font-medium'

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? 'text-white bg-brand-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/75 dark:bg-gray-900/75 border-b border-gray-200 dark:border-gray-800">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="text-lg font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">Translator App</span>
          </NavLink>
          <nav className="hidden sm:flex items-center gap-2">
            <NavItem to="/" label="Home" end />
            <NavItem to="/translate" label="Translate" />
            <NavItem to="/random" label="Random String" />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
