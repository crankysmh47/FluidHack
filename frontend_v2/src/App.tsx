import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Sandbox from './pages/Sandbox';
import History from './pages/History';
import About from './pages/About';
import Markets from './pages/Markets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
        <Route path="/markets" element={<Markets />} />
      </Routes>
    </Router>
  );
}

export default App;
