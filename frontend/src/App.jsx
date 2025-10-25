import './App.css'
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home"
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/Home/HomePage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}/>
      {/* protected admin routes */}
    </Routes>
  )
}

export default App