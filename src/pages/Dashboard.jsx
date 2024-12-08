import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Notes from '../components/Notes';
import Tasks from '../components/Tasks';

const Dashboard = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
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

        if (error) throw error;

        setLists(data || []);
        if (data && data.length > 0 && !selectedList) {
          setSelectedList(data[0]);
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [user, navigate, selectedList]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes & Tasks</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <Sidebar
            lists={lists}
            setLists={setLists}
            selectedList={selectedList}
            setSelectedList={setSelectedList}
          />

          <div className="flex-1">
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex gap-4">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-4 font-medium rounded-t-lg ${
                    activeTab === 'notes'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`py-2 px-4 font-medium rounded-t-lg ${
                    activeTab === 'tasks'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Tasks
                </button>
              </nav>
            </div>

            {activeTab === 'notes' ? (
              <Notes listId={selectedList?.id} />
            ) : (
              <Tasks listId={selectedList?.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
