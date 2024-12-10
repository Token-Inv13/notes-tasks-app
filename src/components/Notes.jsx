import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useNotes } from '../hooks/useNotes'

export default function Notes({ listId }) {
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
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          placeholder="New note..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="w-full p-2 border rounded-lg resize-none"
          rows={4}
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Note
        </button>
      </form>

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
    </div>
  )
}
