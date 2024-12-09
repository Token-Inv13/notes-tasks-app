import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function Sidebar({ activeList, onListSelect }) {
  const [lists, setLists] = useState([])
  const [newListName, setNewListName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    console.log('Sidebar mounted');
    console.log('User:', user);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    if (user) {
      fetchLists()
    }
  }, [user])

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching lists for user:', user.id);
      
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching lists:', error);
        return;
      }

      console.log('Fetched lists:', data);
      if (data) {
        setLists(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    console.log('Starting drag end operation');
    console.log('From position:', result.source.index);
    console.log('To position:', result.destination.index);

    const items = Array.from(lists);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Mettre à jour l'état immédiatement
    setLists(items);
    console.log('Local state updated with new order');

    try {
      console.log('Starting database updates');
      // Mettre à jour les positions une par une
      for (let i = 0; i < items.length; i++) {
        console.log(`Updating item ${items[i].id} to position ${i}`);
        
        const { error } = await supabase
          .from('lists')
          .update({ position: i })
          .eq('id', items[i].id)
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error updating list ${items[i].id}:`, error);
          throw error;
        }
      }
      
      console.log('All positions updated successfully');
      
      // Recharger les listes pour vérifier que tout est correct
      await fetchLists();
    } catch (error) {
      console.error('Error in onDragEnd:', error);
      console.log('Reverting to original order...');
      await fetchLists();
    }
  };

  const addList = async (e) => {
    e.preventDefault()
    if (!newListName.trim()) {
      console.log('List name is empty')
      return
    }

    try {
      console.log('Adding new list:', newListName.trim())
      console.log('User ID:', user?.id)

      if (!user?.id) {
        console.error('User ID is missing')
        return
      }

      const { data, error } = await supabase
        .from('lists')
        .insert([
          {
            name: newListName.trim(),
            user_id: user.id,
            position: lists.length,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding list:', error.message)
        alert('Failed to add list: ' + error.message)
        return
      }

      console.log('List added successfully:', data)
      setNewListName('')
      fetchLists()
      
      if (data) {
        onListSelect(data)
      }
    } catch (error) {
      console.error('Error in addList:', error)
      alert('An unexpected error occurred while adding the list')
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="lists">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1"
              >
                {lists.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
