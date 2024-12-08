import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Notes({ listId }) {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, listId]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching notes for list:', listId);

      const query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listId) {
        query.eq('list_id', listId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }
      
      console.log('Fetched notes:', data);
      setNotes(data || []);
    } catch (error) {
      console.error('Error in fetchNotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    try {
      if (!newNoteContent.trim()) return;

      const noteData = {
        content: newNoteContent,
        user_id: user.id,
        list_id: listId,
      };

      console.log('Adding note with data:', noteData);

      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
        return;
      }

      console.log('Note added successfully:', data);
      setNewNoteContent('');
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error in handleAddNote:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting note:', error);
        return;
      }

      fetchNotes();
    } catch (error) {
      console.error('Error in deleteNote:', error);
    }
  };

  return (
    <div className="relative min-h-[500px]">
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {listId ? "No notes in this list yet" : "Select a list to add notes"}
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 group"
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-800 whitespace-pre-wrap flex-1">
                  {note.content}
                </p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  title="Delete note"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {listId && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span>+</span>
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
            <form onSubmit={handleAddNote}>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full h-32 p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your note..."
                autoFocus
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewNoteContent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
