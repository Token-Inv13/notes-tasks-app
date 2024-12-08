import React from 'react'

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => onTabChange('notes')}
              className={`w-24 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => onTabChange('tasks')}
              className={`w-24 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
