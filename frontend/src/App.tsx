import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResearchDevelopment from './pages/ResearchDevelopment';
import ClinicalTrials from './pages/ClinicalTrials';
import GetInvolved from './pages/GetInvolved';
import ScrollToTop from './components/ScrollToTop';
import ScrollToHash from './components/ScrollToHash';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/research" element={<ResearchDevelopment />} />
        <Route path="/trials" element={<ClinicalTrials />} />
        <Route path="/get-involved" element={<GetInvolved />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
