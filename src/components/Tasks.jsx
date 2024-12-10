import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useTasks } from '../hooks/useTasks'

export default function Tasks({ listId }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const {
    tasks,
    isLoading,
    addTask,
    updateTaskOrder,
    toggleTaskComplete,
    deleteTask
  } = useTasks(listId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const { error } = await addTask(newTaskTitle.trim())
    if (!error) {
      setNewTaskTitle('')
      setShowAddModal(false)
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    await updateTaskOrder(items)
  }

  if (!listId) {
    return <div className="p-4">Select a list to see tasks</div>
  }

  if (isLoading) {
    return <div className="p-4">Loading tasks...</div>
  }

  return (
    <div className="p-4 relative min-h-screen">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {tasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        task.completed
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleTaskComplete(task.id, !task.completed)}
                          className={`p-1 rounded-full mr-2 ${
                            task.completed
                              ? 'text-green-500 hover:text-green-600'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <span className={task.completed ? 'line-through' : ''}>
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-red-500 ml-2"
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-w-[90%]">
            <h3 className="text-lg font-medium mb-4">Add New Task</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full p-2 border rounded-lg mb-4"
                autoFocus
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewTaskTitle('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {listId && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusIcon className="h-8 w-8" />
        </button>
      )}
    </div>
  )
}
