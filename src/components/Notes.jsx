import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function Notes({ listId }) {
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (listId) {
      fetchNotes()
    } else {
      setNotes([])
      setIsLoading(false)
    }
  }, [listId])

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('list_id', listId)
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }

      if (data) {
        setNotes(data);
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

    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Mettre à jour l'état immédiatement
    setNotes(items);
    console.log('Local state updated with new order');

    try {
      console.log('Starting database updates');
      
      // Préparer les données pour la mise à jour
      const updates = items.map((item, index) => ({
        ...item,  // Garder toutes les propriétés existantes
        position: index,  // Mettre à jour la position
      }));

      console.log('Preparing updates:', updates);

      // Mise à jour en une seule opération
      const { data, error } = await supabase
        .from('notes')
        .upsert(updates, {
          returning: 'minimal',
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating positions:', error);
        throw error;
      }

      console.log('Positions updated successfully');
      
      // Recharger les notes pour vérifier
      await fetchNotes();
    } catch (error) {
      console.error('Error in onDragEnd:', error);
      console.log('Reverting to original order...');
      await fetchNotes();
    }
  };

  const addNote = async (e) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            content: newNoteContent.trim(),
            user_id: user.id,
            list_id: listId,
            position: notes.length
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding note:', error)
        return
      }

      setNotes([...notes, data])
      setNewNoteContent('')
      setShowAddModal(false)
    } catch (error) {
      console.error('Error in addNote:', error)
    }
  }

  const deleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting note:', error)
        return
      }

      setNotes(notes.filter(note => note.id !== noteId))
    } catch (error) {
      console.error('Error in deleteNote:', error)
    }
  }

  if (!listId) {
    return <div className="text-center text-gray-500 py-4">Select a list to add notes</div>
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-center text-gray-500">Loading notes...</div>
      ) : (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="notes">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {notes.map((note, index) => (
                    <Draggable key={note.id} draggableId={note.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative group"
                        >
                          <div className="pr-8">
                            <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                          </div>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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

          {showAddModal ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-medium mb-4">Add New Note</h3>
                <form onSubmit={addNote}>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Note content..."
                    className="w-full p-2 border rounded-md mb-4 h-32 resize-none"
                    autoFocus
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        setNewNoteContent('')
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl"
            >
              +
            </button>
          )}
        </>
      )}
    </div>
  )
}
