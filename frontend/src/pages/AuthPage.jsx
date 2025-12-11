import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            if (!formData.email || !formData.password) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
        } else {
            if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
        }

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : { username: formData.username, email: formData.email, password: formData.password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Authentication failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Dispatch event to update Layout
            window.dispatchEvent(new Event('authChange'));

            navigate('/');
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto py-16 relative"
        >
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 font-sans tracking-tight mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isLogin ? 'Sign in to access your dashboard' : 'Join the legal community today'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl flex items-center gap-2 backdrop-blur-md">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    name="username"
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="email"
                                type="email"
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="password"
                                type="password"
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-all flex justify-center items-center gap-2 mt-8 text-lg"
                    >
                        {loading ? <span className="animate-pulse">Processing...</span> : (isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Register</>)}
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-900 font-bold hover:text-slate-700 transition-colors border-b border-slate-900/20 hover:border-slate-900 pb-0.5 ml-1"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AuthPage;
