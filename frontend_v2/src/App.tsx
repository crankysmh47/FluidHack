import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Sandbox from './pages/Sandbox';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
