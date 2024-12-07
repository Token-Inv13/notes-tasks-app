import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Notes({ listId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const { user, isDarkMode } = useAuth();

  useEffect(() => {
    if (listId) {
      fetchNotes();
    }
  }, [listId]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            content: newNote,
            user_id: user.id,
            list_id: listId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const updateNote = async (id, content) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content })
        .eq('id', id);

      if (error) throw error;

      setNotes(
        notes.map((note) =>
          note.id === id ? { ...note, content } : note
        )
      );
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const filteredAndSortedNotes = notes
    .filter((note) =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write your note here..."
          className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDarkMode 
              ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
              : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
          }`}
          rows="4"
        />
        
        <button
          onClick={createNote}
          className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Note
        </button>

        <div className="flex space-x-2 mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className={`flex-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
            }`}
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loading ? (
          <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading notes...
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No notes yet. Create one!
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {filteredAndSortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                {editingNote?.id === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingNote.content}
                      onChange={(e) =>
                        setEditingNote({ ...editingNote, content: e.target.value })
                      }
                      className={`w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-600 text-white border-gray-500' 
                          : 'bg-white text-gray-900 border-gray-300'
                      }`}
                      rows="3"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => updateNote(note.id, editingNote.content)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingNote(note)}
                          className={`p-1 rounded hover:bg-opacity-20 ${
                            isDarkMode 
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className={`p-1 rounded hover:bg-opacity-20 ${
                            isDarkMode 
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
