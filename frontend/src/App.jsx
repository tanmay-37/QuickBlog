import './App.css'
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/Home/HomePage';
import BlogForm from './components/blog form/BlogForm';
function App() {
  return (
    <Routes>
      <Route path="/" element={<BlogForm />}/>
      {/* protected admin routes */}
    </Routes>
  )
}

export default App