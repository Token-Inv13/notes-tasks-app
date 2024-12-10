import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasksService } from '../services/supabase';

export function useTasks(listId) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && listId) {
      fetchTasks();
    }
  }, [user, listId]);

  const fetchTasks = async () => {
    if (!listId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await tasksService.fetchTasks(listId, user.id);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error in useTasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (title) => {
    try {
      const { data, error } = await tasksService.createTask(listId, user.id, title);
      if (error) throw error;
      setTasks(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding task:', err);
      return { data: null, error: err };
    }
  };

  const updateTaskOrder = async (reorderedTasks) => {
    try {
      setTasks(reorderedTasks);
      const { error } = await tasksService.updateTaskPositions(reorderedTasks);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating task order:', err);
      await fetchTasks(); // Revert to original order
    }
  };

  const toggleTaskComplete = async (taskId, completed) => {
    try {
      const { data, error } = await tasksService.toggleTaskComplete(taskId, user.id, completed);
      if (error) throw error;
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
    } catch (err) {
      console.error('Error toggling task:', err);
      return { error: err };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await tasksService.deleteTask(taskId, user.id);
      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      return { error: err };
    }
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTaskOrder,
    toggleTaskComplete,
    deleteTask,
    refreshTasks: fetchTasks
  };
}
