// --- App.jsx ---
import './App.css'
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/Home/HomePage';
import BlogForm from './components/blog form/BlogForm';
import BlogPage from './components/BlogPage';
import MyBlogs from './components/MyBlogs'; // 👈 IMPORT THE NEW PAGE
import { useEffect } from 'react';
import { handleAuthRedirect } from './cognitoAuth';
import LandingPage from './components/LandingPage';


function App() {

// ... useEffect and other logic remains unchanged

  return (
    <>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />}/>
        <Route path="/blogs/:id" element={<BlogPage />}/>
        
        {/* protected routes */}
        <Route path="/blogs/create" 
          element={
            <ProtectedRoute>
              <BlogForm />
            </ProtectedRoute>
          }/>

        {/* ⭐ ADDED: Protected My Blogs Route ⭐ */}
        <Route path="/my-blogs" 
            element={
                <ProtectedRoute>
                    <MyBlogs />
                </ProtectedRoute>
            }
        />
        
        <Route path='/blogs/edit/:id'
        element={<BlogForm isEditMode={true} />}
        />
      </Routes>
    </>
  )
}

export default App;