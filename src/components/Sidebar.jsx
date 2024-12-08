import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ activeList, onListSelect }) {
  const [lists, setLists] = useState([])
  const [newListName, setNewListName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchLists()
    }
  }, [user])

  const fetchLists = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching lists:', error)
        return
      }

      setLists(data || [])
      
      // Si aucune liste n'est sélectionnée et qu'il y a des listes, sélectionner la première
      if (!activeList && data && data.length > 0) {
        onListSelect(data[0])
      }
    } catch (error) {
      console.error('Error in fetchLists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addList = async (e) => {
    e.preventDefault()
    if (!newListName.trim()) return

    try {
      const { data, error } = await supabase
        .from('lists')
        .insert([
          {
            name: newListName.trim(),
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding list:', error)
        return
      }

      setNewListName('')
      fetchLists()
      
      // Sélectionner automatiquement la nouvelle liste
      if (data) {
        onListSelect(data)
      }
    } catch (error) {
      console.error('Error in addList:', error)
    }
  }

  const deleteList = async (listId) => {
    if (!confirm('Are you sure you want to delete this list? All associated notes and tasks will be deleted.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting list:', error)
        return
      }

      // Si la liste supprimée était active, sélectionner la première liste restante
      if (activeList?.id === listId) {
        const remainingLists = lists.filter(l => l.id !== listId)
        if (remainingLists.length > 0) {
          onListSelect(remainingLists[0])
        } else {
          onListSelect(null)
        }
      }

      fetchLists()
    } catch (error) {
      console.error('Error in deleteList:', error)
    }
  }

  return (
    <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 h-full">
      <form onSubmit={addList} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list name..."
            className="flex-1 p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-center text-gray-500 py-4">Loading lists...</div>
      ) : lists.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No lists yet. Create your first list!</div>
      ) : (
        <div className="space-y-1">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                activeList?.id === list.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              <button
                onClick={() => onListSelect(list)}
                className="flex-1 text-left text-sm font-medium truncate"
              >
                {list.name}
              </button>
              <button
                onClick={() => deleteList(list.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                title="Delete list"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
