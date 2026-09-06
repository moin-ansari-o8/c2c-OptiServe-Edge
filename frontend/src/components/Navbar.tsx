import { NavLink } from 'react-router-dom';
import { ROUTES, NAV_ITEMS } from '@/lib/constants';
import { useHealth } from '@/hooks/useHealth';
import { StatusIndicator } from './StatusIndicator';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const health = useHealth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden btn-secondary !px-2 !py-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/20 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 z-40 h-screen w-[220px]
          bg-ink text-cream/90
          flex flex-col
          border-r border-cream/5
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <NavLink
          to={ROUTES.home}
          className="block px-6 pt-8 pb-6"
          onClick={() => setMobileOpen(false)}
        >
          <div className="font-mono text-2xs uppercase tracking-[0.2em] text-cream/40 mb-1">
            OptiServe
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-cream">
            Edge
          </div>
        </NavLink>

        {/* Thin accent line */}
        <div className="mx-6 h-px bg-cream/8" />

        {/* Navigation links */}
        <div className="flex-1 px-3 pt-6 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors duration-200 ${
                  isActive
                    ? 'text-cream bg-cream/8'
                    : 'text-cream/50 hover:text-cream/80 hover:bg-cream/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Bottom status */}
        <div className="px-6 pb-6 space-y-3">
          <div className="h-px bg-cream/8" />

          <div className="space-y-2 pt-2">
            <div className="font-mono text-2xs uppercase tracking-[0.12em] text-cream/60">
              {health.model ? health.model.split('/').pop()?.replace(/-/g, ' ') : 'No Model'}
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={health.online ? 'online' : 'offline'}
              />
              <span className="font-mono text-2xs uppercase tracking-[0.1em] text-cream/50">
                Local
              </span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
