import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Record from './pages/Record';
import Learn from './pages/Learn';
import Mine from './pages/Mine';
import Onboarding from './pages/Onboarding';
import RecordAdd from './pages/RecordAdd';
import DailyGuide from './pages/DailyGuide';
import LearnDetail from './pages/LearnDetail';
import Settings from './pages/Settings';
import LegalDisclaimer from './pages/LegalDisclaimer';
import LegalPrivacy from './pages/LegalPrivacy';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="record" element={<Record />} />
            <Route path="learn" element={<Learn />} />
            <Route path="mine" element={<Mine />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="record-add" element={<RecordAdd />} />
            <Route path="daily-guide" element={<DailyGuide />} />
            <Route path="learn/:id" element={<LearnDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="legal/disclaimer" element={<LegalDisclaimer />} />
            <Route path="legal/privacy" element={<LegalPrivacy />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
