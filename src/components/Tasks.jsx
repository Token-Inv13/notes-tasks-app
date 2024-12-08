import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Tasks({ listId }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, listId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching tasks for list:', listId);

      const query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listId) {
        query.eq('list_id', listId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
      
      console.log('Fetched tasks:', data);
      setTasks(data || []);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    try {
      if (!newTaskContent.trim()) return;

      const taskData = {
        content: newTaskContent,
        user_id: user.id,
        list_id: listId,
        completed: false,
      };

      console.log('Adding task with data:', taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      console.log('Task added successfully:', data);
      setNewTaskContent('');
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error in handleAddTask:', error);
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      fetchTasks();
    } catch (error) {
      console.error('Error in toggleTaskCompletion:', error);
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

      fetchTasks();
    } catch (error) {
      console.error('Error in deleteTask:', error);
    }
  };

  return (
    <div className="relative min-h-[500px]">
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {listId ? "No tasks in this list yet" : "Select a list to add tasks"}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center space-x-4 group"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id, task.completed)}
                className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
              />
              <p className={`text-gray-800 flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.content}
              </p>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete task"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {listId && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center text-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <span>+</span>
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your task..."
                autoFocus
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewTaskContent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
