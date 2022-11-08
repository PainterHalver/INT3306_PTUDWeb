import { Routes, Route, Link } from 'react-router-dom'
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/login">Đăng nhập</Link>
      </nav>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
