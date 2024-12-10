import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useLists } from '../hooks/useLists'

export default function Sidebar({ activeList, onListSelect }) {
  const [newListTitle, setNewListTitle] = useState('')
  const { user } = useAuth()
  const { lists, isLoading, addList, updateListOrder, deleteList } = useLists()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return

    const { error } = await addList(newListTitle.trim())
    if (!error) {
      setNewListTitle('')
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(lists)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    await updateListOrder(items)
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 h-full">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="New list name..."
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="w-full p-2 border rounded-lg mr-2"
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {lists.map((list, index) => (
                <Draggable
                  key={list.id}
                  draggableId={list.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex justify-between items-center p-2 rounded-lg cursor-pointer ${
                        activeList?.id === list.id
                          ? 'bg-blue-100'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                      onClick={() => onListSelect(list)}
                    >
                      <span className="truncate">{list.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteList(list.id)
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
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
    </div>
  )
}
