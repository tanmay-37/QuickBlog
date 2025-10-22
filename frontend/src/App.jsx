import './App.css'
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home"
import ProtectedRoute from './components/ProtectedRoute';


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />}/>

      {/* protected admin routes */}
      

    </Routes>
  )
}

export default App
