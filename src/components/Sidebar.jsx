import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Sidebar = ({ lists, selectedList, setSelectedList, onListsChange, isDarkMode }) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [editingList, setEditingList] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const { user } = useAuth();

  const createList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim() || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          title: newListTitle.trim(),
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Détails de l\'erreur:', error);
        throw error;
      }

      const newLists = [...lists, data];
      onListsChange(newLists);
      setSelectedList(data);
      setNewListTitle('');
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error.message);
      alert('Erreur lors de la création de la liste. Veuillez réessayer.');
    }
  };

  const updateList = async (listId) => {
    if (!editTitle.trim() || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('lists')
        .update({ 
          title: editTitle.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', listId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedLists = lists.map(list => 
        list.id === listId ? data : list
      );
      onListsChange(updatedLists);
      if (selectedList?.id === listId) {
        setSelectedList(data);
      }
      setEditingList(null);
      setEditTitle('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la liste:', error.message);
      alert('Erreur lors de la mise à jour de la liste. Veuillez réessayer.');
    }
  };

  const deleteList = async (listId) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) throw error;

      const remainingLists = lists.filter(list => list.id !== listId);
      onListsChange(remainingLists);
      if (selectedList?.id === listId) {
        setSelectedList(remainingLists[0] || null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error.message);
      alert('Erreur lors de la suppression de la liste. Veuillez réessayer.');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || !user?.id) return;

    const reorderedLists = Array.from(lists);
    const [movedList] = reorderedLists.splice(result.source.index, 1);
    reorderedLists.splice(result.destination.index, 0, movedList);

    const updatedLists = reorderedLists.map((list, index) => ({
      ...list,
      position: index
    }));

    onListsChange(updatedLists);

    try {
      const { error } = await supabase
        .from('lists')
        .upsert(
          updatedLists.map(({ id, position }) => ({
            id,
            position,
            user_id: user.id
          }))
        );

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log('List positions updated');
    } catch (error) {
      console.error('Error updating list positions:', error);
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <form onSubmit={createList} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="Nouvelle liste..."
            className={`flex-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-md ${
              isDarkMode
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            Ajouter
          </button>
        </div>
      </form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lists">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={String(list.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        selectedList?.id === list.id
                          ? 'bg-indigo-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedList(list)}
                    >
                      {editingList?.id === list.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => updateList(list.id)}
                          onKeyPress={(e) => e.key === 'Enter' && updateList(list.id)}
                          className={`flex-1 p-1 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isDarkMode 
                              ? 'bg-gray-600 text-white border-gray-500' 
                              : 'bg-white text-gray-900 border-gray-300'
                          }`}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-1">{list.title}</span>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingList(list);
                            setEditTitle(list.title);
                          }}
                          className={`p-1 rounded-full hover:bg-opacity-20 ${
                            isDarkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-500'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
                              deleteList(list.id);
                            }
                          }}
                          className={`p-1 rounded-full hover:bg-opacity-20 ${
                            isDarkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-500'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Sidebar;
