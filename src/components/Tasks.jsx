import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useTasks } from '../hooks/useTasks'

export default function Tasks({ listId }) {
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
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    await updateTaskOrder(items)
  }

  if (isLoading) {
    return <div className="p-4">Loading tasks...</div>
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="New task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Task
        </button>
      </form>

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
    </div>
  )
}
