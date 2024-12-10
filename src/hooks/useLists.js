import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listsService } from '../services/supabase';

export function useLists() {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await listsService.fetchLists(user.id);
      
      if (error) throw error;
      setLists(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error in useLists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addList = async (title) => {
    try {
      const { data, error } = await listsService.createList(user.id, title);
      if (error) throw error;
      setLists(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding list:', err);
      return { data: null, error: err };
    }
  };

  const updateListOrder = async (reorderedLists) => {
    try {
      setLists(reorderedLists);
      const { error } = await listsService.updateListPositions(reorderedLists);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating list order:', err);
      await fetchLists(); // Revert to original order
    }
  };

  const deleteList = async (listId) => {
    try {
      const { error } = await listsService.deleteList(listId, user.id);
      if (error) throw error;
      setLists(prev => prev.filter(list => list.id !== listId));
    } catch (err) {
      console.error('Error deleting list:', err);
      return { error: err };
    }
  };

  return {
    lists,
    isLoading,
    error,
    addList,
    updateListOrder,
    deleteList,
    refreshLists: fetchLists
  };
}
