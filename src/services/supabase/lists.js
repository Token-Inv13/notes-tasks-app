import { supabase } from '../../config/supabase';

export const listsService = {
  async fetchLists(userId) {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching lists:', error);
      return { data: null, error };
    }
  },

  async createList(userId, title) {
    try {
      const { data: existingLists } = await this.fetchLists(userId);
      const position = existingLists ? existingLists.length : 0;

      const { data, error } = await supabase
        .from('lists')
        .insert([{ title, user_id: userId, position }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating list:', error);
      return { data: null, error };
    }
  },

  async updateListPositions(lists) {
    try {
      const updates = lists.map((item, index) => ({
        ...item,
        position: index,
      }));

      const { data, error } = await supabase
        .from('lists')
        .upsert(updates, {
          returning: 'minimal',
          onConflict: 'id'
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating list positions:', error);
      return { data: null, error };
    }
  },

  async deleteList(listId, userId) {
    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting list:', error);
      return { error };
    }
  }
};
