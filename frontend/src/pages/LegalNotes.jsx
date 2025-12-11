import React, { useEffect, useState } from 'react';
import { FileText, Download, ChevronDown, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingLegalIcons from '../components/FloatingLegalIcons';
import { API_URL } from '../config';

const LegalNotes = () => {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSemester, setExpandedSemester] = useState(null);
    const [expandedSubject, setExpandedSubject] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/notes`)
            .then(res => res.json())
            .then(data => {
                setSemesters(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch notes", err);
                setLoading(false);
            });
    }, []);

    const toggleSemester = (id) => {
        setExpandedSemester(expandedSemester === id ? null : id);
        setExpandedSubject(null); // Reset subject expansion when switching semesters
    };

    const toggleSubject = (id, e) => {
        e.stopPropagation();
        setExpandedSubject(expandedSubject === id ? null : id);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            <FloatingLegalIcons />
            <div className="mb-12 text-center relative">
                <h1 className="text-5xl font-sans font-black mb-4 text-slate-900 tracking-tight">Legal Notes <span className="text-warm-brown-500">Repository</span></h1>
                <p className="text-warm-brown-600 text-lg font-light">Curated jurisprudence materials organized by Semester</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-900 animate-pulse tracking-widest uppercase text-sm">Loading library...</div>
            ) : (
                <div className="space-y-6">
                    {semesters.map((sem) => (
                        <motion.div
                            key={sem.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 transition-all duration-300 ${expandedSemester === sem.id ? 'shadow-md border-slate-300' : ''}`}
                        >
                            {/* Semester Header */}
                            <div
                                className={`p-6 flex items-center justify-between cursor-pointer transition-all ${sem.status === 'active' ? 'hover:bg-white/5' : 'opacity-60 cursor-not-allowed bg-black/20'
                                    }`}
                                onClick={() => sem.status === 'active' && toggleSemester(sem.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold text-slate-800 tracking-wide">{sem.title}</h2>
                                    {sem.status === 'coming_soon' && (
                                        <span className="text-xs font-bold px-3 py-1 bg-white/5 text-neo-gray rounded-full flex items-center gap-1 border border-white/10 uppercase tracking-widest">
                                            <Lock size={12} /> Locked
                                        </span>
                                    )}
                                </div>
                                {sem.status === 'active' && (
                                    <motion.div
                                        animate={{ rotate: expandedSemester === sem.id ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${expandedSemester === sem.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        <ChevronDown size={16} />
                                    </motion.div>
                                )}
                            </div>

                            {/* Semester Content (Subjects) */}
                            <AnimatePresence>
                                {expandedSemester === sem.id && sem.subjects && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-100 bg-slate-50"
                                    >
                                        {sem.subjects.map((subject) => (
                                            <div key={subject.id} className="border-b border-white/5 last:border-0 pl-6">
                                                <div
                                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-neo-green/5 transition-colors group"
                                                    onClick={(e) => toggleSubject(subject.id, e)}
                                                >
                                                    <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{subject.name}</span>
                                                    <motion.div
                                                        animate={{ rotate: expandedSubject === subject.id ? 180 : 0 }}
                                                    >
                                                        <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                                                    </motion.div>
                                                </div>

                                                {/* Subject Content (Resources) */}
                                                <AnimatePresence>
                                                    {expandedSubject === subject.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-white p-6 pl-12 grid md:grid-cols-2 gap-8 border-t border-slate-100"
                                                        >
                                                            {/* Notes Section */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                    <FileText size={14} /> Notes
                                                                </h4>
                                                                <ul className="space-y-3">
                                                                    {subject.resources.notes.length > 0 ? (
                                                                        subject.resources.notes.map((note, idx) => (
                                                                            <motion.li
                                                                                key={idx}
                                                                                initial={{ x: -10, opacity: 0 }}
                                                                                animate={{ x: 0, opacity: 1 }}
                                                                                transition={{ delay: idx * 0.1 }}
                                                                            >
                                                                                <a href={note.url} className="text-sm p-3 rounded-lg bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 flex items-center justify-between group transition-all">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                                                        {note.title}
                                                                                    </div>
                                                                                    <Download size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2" />
                                                                                </a>
                                                                            </motion.li>
                                                                        ))
                                                                    ) : (
                                                                        <li className="text-sm text-white/20 italic">No notes available</li>
                                                                    )}
                                                                </ul>
                                                            </div>

                                                            {/* Previous Qns Section */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                    <FileText size={14} /> Previous Qns
                                                                </h4>
                                                                <ul className="space-y-3">
                                                                    {subject.resources.previousQns.length > 0 ? (
                                                                        subject.resources.previousQns.map((qn, idx) => (
                                                                            <motion.li
                                                                                key={idx}
                                                                                initial={{ x: -10, opacity: 0 }}
                                                                                animate={{ x: 0, opacity: 1 }}
                                                                                transition={{ delay: idx * 0.1 }}
                                                                            >
                                                                                <a href={qn.url} className="text-sm p-3 rounded-lg bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-between group transition-all">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                                                        {qn.title}
                                                                                    </div>
                                                                                    <Download size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2" />
                                                                                </a>
                                                                            </motion.li>
                                                                        ))
                                                                    ) : (
                                                                        <li className="text-sm text-white/20 italic">No papers available</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default LegalNotes;
