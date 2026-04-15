import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Sandbox from './pages/Sandbox';
import History from './pages/History';
import About from './pages/About';
import Markets from './pages/Markets';
import PSLBranding from './components/PSLBranding';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen overflow-x-hidden">
        <PSLBranding />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
            <Route path="/markets" element={<Markets />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
