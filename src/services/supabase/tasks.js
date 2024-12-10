import { supabase } from '../../../config/supabase';

export const tasksService = {
  async fetchTasks(listId, userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('list_id', listId)
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: null, error };
    }
  },

  async createTask(listId, userId, title) {
    try {
      const { data: existingTasks } = await this.fetchTasks(listId, userId);
      const position = existingTasks ? existingTasks.length : 0;

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title,
          list_id: listId,
          user_id: userId,
          position,
          completed: false
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  },

  async updateTaskPositions(tasks) {
    try {
      const updates = tasks.map((item, index) => ({
        ...item,
        position: index,
      }));

      const { data, error } = await supabase
        .from('tasks')
        .upsert(updates, {
          returning: 'minimal',
          onConflict: 'id'
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating task positions:', error);
      return { data: null, error };
    }
  },

  async toggleTaskComplete(taskId, userId, completed) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      return { data: null, error };
    }
  },

  async deleteTask(taskId, userId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error };
    }
  }
};
