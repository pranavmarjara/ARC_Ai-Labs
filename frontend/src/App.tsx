import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResearchDevelopment from './pages/ResearchDevelopment';
import ClinicalTrials from './pages/ClinicalTrials';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/research" element={<ResearchDevelopment />} />
        <Route path="/trials" element={<ClinicalTrials />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
