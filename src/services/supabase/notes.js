import { supabase } from '@/config/supabase.js';

export const notesService = {
  async fetchNotes(listId, userId) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('list_id', listId)
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return { data: null, error };
    }
  },

  async createNote(listId, userId, content) {
    try {
      const { data: existingNotes } = await this.fetchNotes(listId, userId);
      const position = existingNotes ? existingNotes.length : 0;

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          content,
          list_id: listId,
          user_id: userId,
          position
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating note:', error);
      return { data: null, error };
    }
  },

  async updateNotePositions(notes) {
    try {
      const updates = notes.map((item, index) => ({
        ...item,
        position: index,
      }));

      const { data, error } = await supabase
        .from('notes')
        .upsert(updates, {
          returning: 'minimal',
          onConflict: 'id'
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating note positions:', error);
      return { data: null, error };
    }
  },

  async updateNoteContent(noteId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ content })
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating note content:', error);
      return { data: null, error };
    }
  },

  async deleteNote(noteId, userId) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { error };
    }
  }
};
