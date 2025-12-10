import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import LegalNotes from './pages/LegalNotes';
import Feedback from './pages/Feedback';
import AuthPage from './pages/AuthPage';
import LegalAI from './pages/LegalAI';
import './App.css'; // Retain for any lingering custom styles or reset them

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="notes" element={<LegalNotes />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="legal-ai" element={<LegalAI />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;