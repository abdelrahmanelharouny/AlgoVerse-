import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Problems from './pages/Problems';
import Visualizer from './pages/Visualizer';
import Analysis from './pages/Analysis';
import Playground from './pages/Playground';
import ChallengeMode from './pages/ChallengeMode';
import ChallengeDetail from './pages/ChallengeDetail';
import V3Demo from './pages/V3Demo';
import CaseStudies from './pages/CaseStudies';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="problems" element={<Problems />} />
            <Route path="visualizer/:algorithm" element={<Visualizer />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="playground" element={<Playground />} />
            <Route path="challenge" element={<ChallengeMode />} />
            <Route path="challenge/:challengeId" element={<ChallengeDetail />} />
            <Route path="v3-demo" element={<V3Demo />} />
            <Route path="case-studies" element={<CaseStudies />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

