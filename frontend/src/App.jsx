import './App.css'
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home"
import Login from './admin/Login';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/admin" element={<Login />}/>

    </Routes>
  )
}

export default App
