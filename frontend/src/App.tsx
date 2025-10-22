import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResearchDevelopment from './pages/ResearchDevelopment';
import ClinicalTrials from './pages/ClinicalTrials';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/research" element={<ResearchDevelopment />} />
        <Route path="/trials" element={<ClinicalTrials />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
