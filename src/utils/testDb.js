import { supabase } from '../lib/supabase';

export const testDatabaseConnection = async (userId) => {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Check if we can read from the lists table
    console.log('Test 1: Reading from lists table...');
    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .limit(1);
    
    if (listsError) {
      console.error('Failed to read from lists table:', listsError);
    } else {
      console.log('Successfully read from lists table:', lists);
    }

    // Test 2: Try to insert a test list
    console.log('Test 2: Inserting test list...');
    const { data: insertedList, error: insertError } = await supabase
      .from('lists')
      .insert([
        {
          title: 'Test List',
          user_id: userId,
          position: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (insertError) {
      console.error('Failed to insert test list:', insertError);
    } else {
      console.log('Successfully inserted test list:', insertedList);

      // Test 3: Clean up by deleting the test list
      console.log('Test 3: Cleaning up test list...');
      const { error: deleteError } = await supabase
        .from('lists')
        .delete()
        .eq('id', insertedList[0].id);

      if (deleteError) {
        console.error('Failed to delete test list:', deleteError);
      } else {
        console.log('Successfully deleted test list');
      }
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
};
