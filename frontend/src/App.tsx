import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Problems = lazy(() => import('./pages/Problems'));
const Visualizer = lazy(() => import('./pages/Visualizer'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Playground = lazy(() => import('./pages/Playground'));
const ChallengeMode = lazy(() => import('./pages/ChallengeMode'));
const ChallengeDetail = lazy(() => import('./pages/ChallengeDetail'));
const V3Demo = lazy(() => import('./pages/V3Demo'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));

const RouteLoadingFallback = () => (
  <div className="flex min-h-[45vh] items-center justify-center" role="status" aria-live="polite">
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      Loading page…
    </div>
  </div>
);

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <Router>
        <Suspense fallback={<RouteLoadingFallback />}>
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
        </Suspense>
        </Router>
      </ErrorBoundary>
    </MotionConfig>
  );
}

export default App;
