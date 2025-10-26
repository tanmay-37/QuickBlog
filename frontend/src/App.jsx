import './App.css'
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/Home/HomePage';
import BlogForm from './components/blog form/BlogForm';
import BlogPage from './components/BlogPage';
function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<HomePage />}/>
      <Route path="/blogs/:id" element={<BlogPage />}/>
      
      {/* protected routes */}
      <Route path="/blogs/create" 
        element={
          <ProtectedRoute>
            <BlogForm />
          </ProtectedRoute>
        }/>

      <Route path='/blogs/edit/:id'
      element={<BlogForm isEditMode={true} />}
      />
    </Routes>
  )
}

export default App;