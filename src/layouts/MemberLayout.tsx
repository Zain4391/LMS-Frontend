import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, BookMarked, AlertCircle, CreditCard, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const nav = [
  { to: '/app', label: 'Dashboard', icon: BookOpen, end: true },
  { to: '/app/books', label: 'Browse Books', icon: BookMarked },
  { to: '/app/borrows', label: 'My Borrows', icon: BookMarked },
  { to: '/app/fines', label: 'My Fines', icon: AlertCircle },
  { to: '/app/payments', label: 'Payments', icon: CreditCard },
  { to: '/app/profile', label: 'Profile', icon: User },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-primary/10 text-primary font-medium'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`
}

export default function MemberLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 border-b border-border px-4 py-5">
        <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="font-semibold text-sm">LMS Member</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2" aria-label="Member navigation">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setOpen(false)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="mb-2 truncate px-2 text-xs text-muted-foreground" title={user?.name}>
          {user?.name}
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="font-semibold text-sm">LMS Member</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto" id="main-content">
          <div className="mx-auto max-w-5xl p-4 md:p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
