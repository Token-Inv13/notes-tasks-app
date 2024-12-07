import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { SunIcon, MoonIcon, MenuIcon } from '@heroicons/react/outline'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* User info */}
          <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              to="/"
              className={`${
                location.pathname === '/'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white`}
            >
              Notes
            </Link>
            <Link
              to="/tasks"
              className={`${
                location.pathname === '/tasks'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-white`}
            >
              Tasks
            </Link>
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-gray-900 dark:text-white" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-900 dark:text-white" />
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="md:hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
