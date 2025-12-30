import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Gavel, Menu, X, BookOpen, MessageSquare, Award, User, LogOut, Scale, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const checkAuth = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        else setUser(null);
    };

    useEffect(() => {
        checkAuth();
        window.addEventListener('authChange', checkAuth);
        return () => window.removeEventListener('authChange', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    const navItems = [
        { path: '/', label: 'Home', icon: null },
        { path: '/quiz', label: 'Start Quiz', icon: null },
        { path: '/notes', label: 'Legal Notes', icon: BookOpen },
        { path: '/legal-ai', label: 'BNS Bridge', icon: Scale },
        { path: '/definitions', label: 'Definitions', icon: Quote },
        { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
                                <Gavel size={20} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">
                                Quo<span className="text-warm-brown-500 font-normal">Nova</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm uppercase tracking-wide">Home</Link>
                            <Link to="/quiz" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm uppercase tracking-wide">Quiz</Link>
                            <Link to="/notes" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm uppercase tracking-wide">Notes</Link>
                            <Link to="/legal-ai" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm uppercase tracking-wide">BNS Bridge</Link>
                            <Link to="/definitions" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm uppercase tracking-wide">Definitions</Link>
                            <Link to="/feedback" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm uppercase tracking-wide">Feedback</Link>

                            {user ? (
                                <div className="flex items-center gap-4 pl-8 border-l border-slate-200">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-sm font-bold text-slate-900 leading-none mb-1">{user.username}</div>
                                        <div className="text-xs text-warm-brown-500 uppercase tracking-wider font-bold">Student</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-500 transition-all"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/auth">
                                    <button className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm flex items-center gap-2">
                                        <User size={18} />
                                        <span>Sign In</span>
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200 overflow-hidden shadow-lg"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                <Link to="/" className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                                <Link to="/quiz" className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all font-medium" onClick={() => setIsMobileMenuOpen(false)}>Quiz</Link>
                                <Link to="/notes" className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all font-medium" onClick={() => setIsMobileMenuOpen(false)}>Legal Notes</Link>
                                <Link to="/legal-ai" className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all font-medium" onClick={() => setIsMobileMenuOpen(false)}>BNS Bridge</Link>
                                <Link to="/definitions" className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all font-medium" onClick={() => setIsMobileMenuOpen(false)}>Definitions</Link>
                                <Link to="/feedback" className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all font-medium" onClick={() => setIsMobileMenuOpen(false)}>Feedback</Link>
                                {user ? (
                                    <button
                                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                        className="w-full text-left px-4 py-3 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all flex items-center gap-2 font-medium"
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                ) : (
                                    <Link to="/auth" className="block px-4 py-3 rounded-lg text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-70">
                        <Gavel size={16} className="text-slate-500" />
                        <span className="text-sm font-semibold text-warm-brown-600">QuoNova</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} All rights reserved.
                    </div>
                    <div className="text-sm text-slate-400 font-medium">
                        Excellence in Legal Education
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
