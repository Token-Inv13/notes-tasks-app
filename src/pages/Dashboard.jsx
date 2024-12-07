import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Notes from '../components/Notes';
import Tasks from '../components/Tasks';

const Dashboard = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' ou 'tasks'
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLists = async () => {
      try {
        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Erreur lors de la récupération des listes:', error);
          setError(error.message);
          return;
        }

        setLists(data || []);
        if (data && data.length > 0 && !selectedList) {
          setSelectedList(data[0]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des listes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();

    const listsSubscription = supabase
      .channel('lists-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lists',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Changement détecté:', payload);
          fetchLists();
        }
      )
      .subscribe();

    return () => {
      listsSubscription.unsubscribe();
    };
  }, [user, navigate]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          Erreur: {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notes & Tasks</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => {
                supabase.auth.signOut();
                navigate('/login');
              }}
              className={`px-4 py-2 rounded-md ${
                isDarkMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar
              lists={lists}
              selectedList={selectedList}
              setSelectedList={setSelectedList}
              onListsChange={setLists}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="col-span-9">
            <div className="mb-6">
              <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'notes'
                      ? isDarkMode
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      activeTab === 'notes'
                        ? isDarkMode
                          ? 'text-purple-400'
                          : 'text-purple-600'
                        : 'text-gray-400'
                    }`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex items-center px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'tasks'
                      ? isDarkMode
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-blue-600 border-b-2 border-blue-600'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      activeTab === 'tasks'
                        ? isDarkMode
                          ? 'text-blue-400'
                          : 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  Tasks
                </button>
              </div>
            </div>

            {selectedList ? (
              activeTab === 'notes' ? (
                <Notes
                  listId={selectedList.id}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <Tasks
                  listId={selectedList.id}
                  isDarkMode={isDarkMode}
                />
              )
            ) : (
              <div className={`p-8 text-center rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <p className="text-lg">
                  Créez une nouvelle liste pour commencer à ajouter des notes et des tâches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
