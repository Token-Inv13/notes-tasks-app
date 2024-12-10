import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useNotes } from '../hooks/useNotes'

export default function Notes({ listId }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const {
    notes,
    isLoading,
    addNote,
    updateNoteOrder,
    updateNoteContent,
    deleteNote
  } = useNotes(listId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return

    const { error } = await addNote(newNoteContent.trim())
    if (!error) {
      setNewNoteContent('')
      setShowAddModal(false)
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(notes)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    await updateNoteOrder(items)
  }

  if (isLoading) {
    return <div className="p-4">Loading notes...</div>
  }

  return (
    <div className="p-4 relative min-h-screen">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="notes">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {notes.map((note, index) => (
                <Draggable
                  key={note.id}
                  draggableId={note.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <textarea
                          value={note.content}
                          onChange={(e) =>
                            updateNoteContent(note.id, e.target.value)
                          }
                          className="flex-1 resize-none border-none focus:ring-0 p-0"
                          rows={Math.max(
                            1,
                            note.content.split('\n').length
                          )}
                        />
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-w-[90%]">
            <h3 className="text-lg font-medium mb-4">Add New Note</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Note content..."
                className="w-full p-2 border rounded-lg mb-4 h-32 resize-none"
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
      >
        <PlusIcon className="h-8 w-8" />
      </button>
    </div>
  )
}
