import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/map', label: 'Risk Map' },
  { to: '/report', label: 'Field Report' },
  { to: '/admin', label: 'Admin' },
]

export default function Navbar() {
  return (
    <nav className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xl font-bold leading-tight">SlopeSafe NER</p>
          <p className="text-xs text-blue-200">Landslide Risk Monitoring and Early Warning Prototype</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-navy'
                    : 'bg-navy-light text-white hover:bg-blue-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
