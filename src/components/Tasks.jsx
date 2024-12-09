import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Tasks({ listId }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (listId) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [listId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('list_id', listId)
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Mettre à jour l'état immédiatement
    setTasks(items);

    try {
      // Mettre à jour les positions une par une
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase
          .from('tasks')
          .update({ position: i })
          .eq('id', items[i].id)
          .eq('user_id', user.id)
          .eq('list_id', listId);

        if (error) {
          console.error('Error updating task position:', error);
          throw error;
        }
      }
      
      console.log('Task positions updated successfully');
    } catch (error) {
      console.error('Error in onDragEnd:', error);
      // En cas d'erreur, recharger les tâches
      await fetchTasks();
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            content: newTaskContent.trim(),
            user_id: user.id,
            list_id: listId,
            position: tasks.length,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      setTasks([...tasks, data]);
      setNewTaskContent('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error in addTask:', error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error('Error in toggleTask:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error in deleteTask:', error);
    }
  };

  if (!listId) {
    return (
      <div className="text-center text-gray-500 py-4">
        Select a list to add tasks
      </div>
    );
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-center text-gray-500">Loading tasks...</div>
      ) : (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => toggleTask(task.id, e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span
                              className={`text-sm ${
                                task.completed ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {task.content}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-600"
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
                <h3 className="text-lg font-medium mb-4">Add New Task</h3>
                <form onSubmit={addTask}>
                  <input
                    type="text"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    placeholder="Task content..."
                    className="w-full p-2 border rounded-md mb-4"
                    autoFocus
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setNewTaskContent('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-8 right-8 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center text-2xl"
            >
              +
            </button>
          )}
        </>
      )}
    </div>
  );
}
