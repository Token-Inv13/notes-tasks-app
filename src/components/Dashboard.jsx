import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Notes from './Notes'
import Tasks from './Tasks'
import Sidebar from './Sidebar'
import Navigation from './Navigation'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notes')
  const [activeList, setActiveList] = useState(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Notes & Tasks</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          activeList={activeList}
          onListSelect={setActiveList}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-full mx-auto py-6 px-4">
            <Navigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="mt-6">
              {activeTab === 'notes' ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <Notes listId={activeList?.id} />
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <Tasks listId={activeList?.id} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
