import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Trophy, Calendar, User } from 'lucide-react';
import { API_URL } from '../config';

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data.user);
        setScores(res.data.user.scores || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  };

  if (loading) return <div className="p-10 text-center text-slate-900 font-mono animate-pulse uppercase tracking-widest">Loading identity...</div>;
  if (error) return <div className="p-10 text-red-500 font-mono text-center border border-red-200 bg-red-50 rounded-lg max-w-md mx-auto mt-10">ERROR: {error}</div>;
  if (!user) return <div className="p-10 text-slate-500 font-mono text-center">No user data found</div>;

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="bg-white p-8 rounded-3xl relative overflow-hidden shadow-sm border border-slate-200">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center gap-6">
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 font-sans tracking-tight mb-1">{user.username}</h2>
              <p className="text-sm text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-all uppercase tracking-widest text-xs font-bold"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-500" /> Top Score
            </h3>
            <p className="text-5xl font-black text-slate-900">
              {scores.length ? Math.max(...scores.map(s => s.score)) : '—'}
            </p>
          </div>

          <div className="col-span-2 bg-white border border-slate-200 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Score History
            </h3>

            {scores.length === 0 && <p className="text-sm text-slate-400 italic py-4">No scores yet. Take a quiz to appear on the leaderboard.</p>}

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {scores.slice().reverse().map((s, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-all group">
                  <div className="text-sm text-slate-700 font-medium">Quiz <span className="text-slate-400">#{s.quizId}</span></div>
                  <div className="flex items-center gap-6">
                    <div className="text-xs text-slate-500 font-mono">{s.date}</div>
                    <div className="text-xl font-bold text-slate-900 w-12 text-right">{s.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
