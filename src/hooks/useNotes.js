import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notesService } from '../services/supabase';

export function useNotes(listId) {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && listId) {
      fetchNotes();
    }
  }, [user, listId]);

  const fetchNotes = async () => {
    if (!listId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await notesService.fetchNotes(listId, user.id);
      
      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error in useNotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (content) => {
    try {
      const { data, error } = await notesService.createNote(listId, user.id, content);
      if (error) throw error;
      setNotes(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding note:', err);
      return { data: null, error: err };
    }
  };

  const updateNoteOrder = async (reorderedNotes) => {
    try {
      setNotes(reorderedNotes);
      const { error } = await notesService.updateNotePositions(reorderedNotes);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating note order:', err);
      await fetchNotes(); // Revert to original order
    }
  };

  const updateNoteContent = async (noteId, content) => {
    try {
      const { data, error } = await notesService.updateNoteContent(noteId, user.id, content);
      if (error) throw error;
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, content } : note
      ));
    } catch (err) {
      console.error('Error updating note:', err);
      return { error: err };
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const { error } = await notesService.deleteNote(noteId, user.id);
      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      return { error: err };
    }
  };

  return {
    notes,
    isLoading,
    error,
    addNote,
    updateNoteOrder,
    updateNoteContent,
    deleteNote,
    refreshNotes: fetchNotes
  };
}
