import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingLegalIcons from '../components/FloatingLegalIcons';
import { API_URL } from '../config';

const Feedback = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'General Query',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', category: 'General Query', message: '' });
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto py-24 text-center relative"
            >
                <FloatingLegalIcons />
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-bold mb-4 font-sans text-slate-900 tracking-tight">Message Sent!</h2>
                <p className="text-slate-500 mb-10 text-lg">Thank you for your feedback. We'll get back to you shortly.</p>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm" onClick={() => setStatus('idle')}>
                    Send Another Message
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
        >
            <div className="text-center mb-12 relative">
                <h1 className="text-5xl font-sans font-black mb-4 text-slate-900 tracking-tight">Contact & <span className="text-warm-brown-500">Support</span></h1>
                <p className="text-warm-brown-600 text-lg font-light">Have a question or suggestion? We'd love to hear from you.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 relative overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full p-4 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full p-4 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
                        <div className="relative">
                            <select
                                name="category"
                                className="w-full p-4 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option>General Query</option>
                                <option>Report a Bug</option>
                                <option>Content Suggestion</option>
                                <option>Legal Question</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neo-text">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Message</label>
                        <textarea
                            name="message"
                            required
                            rows="5"
                            className="w-full p-4 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                            placeholder="How can we help you?"
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-5 bg-slate-900 text-white font-bold text-lg rounded-xl shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                    >
                        {status === 'submitting' ? (
                            <span className="animate-pulse">Sending...</span>
                        ) : (
                            <>
                                <Send size={20} className="group-hover:translate-x-1 transition-transform" /> Send Message
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default Feedback;
