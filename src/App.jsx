import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route index element={<Notes />} />
                    <Route path="tasks" element={<Tasks />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
