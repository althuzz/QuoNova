import React, { useState } from 'react';
import { Search, ArrowRight, BookOpen, AlertCircle, Scale, Sparkles, MoveRight, CornerDownRight, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bnsData } from '../data/bnsMapping';
import RobotMascot from '../components/RobotMascot';

const BNSConverter = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [explanation, setExplanation] = useState({ id: null, text: "", loading: false });

    const handleRequestDemo = () => {
        window.location.href = "mailto:demo@legalai.tech?subject=Requesting BNS Bridge Demo";
    };

    const handleExplain = async (item) => {
        if (explanation.id === item.ipc && explanation.text) {
            setExplanation({ id: null, text: "", loading: false }); // Toggle off
            return;
        }

        setExplanation({ id: item.ipc, text: "", loading: true });

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Validating my understanding of the new Indian laws. specifically the transition from IPC to BNS.
                    
                    Explain the changes between:
                    IPC Section: ${item.ipc}
                    BNS Section: ${item.bns}
                    Title: ${item.title}
                    Noted Change: ${item.change}
                    
                    Please provide a concise, expert legal summary of why this change offers, any nuance in language, or shift in legal philosophy.`
                }),
            });

            const data = await response.json();
            setExplanation({ id: item.ipc, text: data.reply, loading: false });
        } catch (error) {
            console.error("AI Error:", error);
            setExplanation({ id: item.ipc, text: "System is currently offline or unreachable.", loading: false });
        }
    };

    const filteredResults = bnsData.filter(item =>
        item.ipc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bns.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F4F4F4] text-black font-mono selection:bg-black selection:text-white overflow-x-hidden relative">

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '64px 64px' }}
            />

            {/* Navbar Placeholder / Top Bar */}
            <div className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center border-b border-black/10 bg-[#F4F4F4]/90 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-black rounded-full" />
                    <span className="font-bold tracking-widest text-xs uppercase">System.Bridge.v2</span>
                </div>
                <div className="text-[10px] tracking-tight text-slate-400">STATUS: ONLINE // LATENCY: 12ms</div>
                <button
                    onClick={handleRequestDemo}
                    className="border border-black px-4 py-1 text-xs hover:bg-black hover:text-white transition-colors uppercase font-bold"
                >
                    Request Demo
                </button>
            </div>

            <div className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto">

                {/* Hero Section Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">

                    {/* Left: Typography & Search */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 text-slate-400 text-xs tracking-[0.2em] uppercase mb-4"
                            >
                                <span className="w-12 h-[1px] bg-black"></span>
                                <span>Codebase / Legal / Convert</span>
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8]">
                                IPC1860.<br />
                                <span className="outline-text text-transparent bg-clip-text" style={{ WebkitTextStroke: '2px black' }}>TO.</span><br />
                                BNS2023.
                            </h1>

                            <p className="max-w-md text-sm text-slate-500 font-sans leading-relaxed border-l-2 border-black pl-4 py-2 mt-8">
                                Simulating the transition from <span className="font-bold text-black">IPC 1860</span> to the corresponding <span className="font-bold text-black">BNS 2023</span>. Analyze legal codebases with precision.
                            </p>
                        </div>

                        {/* Tech Search Input */}
                        <div className="relative max-w-lg group">
                            <div className="absolute -inset-2 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                            <div className="bg-white border-2 border-black p-1 flex items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                                <div className="px-4 text-black">
                                    <Terminal size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Input Section Code..."
                                    className="flex-1 bg-transparent border-none outline-none py-4 font-mono uppercase tracking-wide text-sm placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="px-4">
                                    <div className="w-2 h-5 bg-black animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Schematic Mascot */}
                    <div className="relative flex justify-center lg:justify-end">
                        {/* Schematic Lines Background */}
                        <div className="absolute inset-0 z-0">
                            <svg className="w-full h-full opacity-20" style={{ strokeDasharray: '4 4' }}>
                                <line x1="50%" y1="50%" x2="0%" y2="20%" stroke="black" strokeWidth="1" />
                                <line x1="50%" y1="50%" x2="100%" y2="80%" stroke="black" strokeWidth="1" />
                                <circle cx="50%" cy="50%" r="150" fill="none" stroke="black" strokeWidth="1" />
                            </svg>
                        </div>

                        <div className="relative z-10 scale-125">
                            <RobotMascot />
                        </div>

                        {/* Floating Data Labels */}
                        <motion.div
                            className="absolute top-10 right-10 bg-white border border-black px-2 py-1 text-[10px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            AI: ACTIVE
                        </motion.div>
                    </div>

                </div>

                {/* Stats / Metrics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-black/10 py-8 mb-16">
                    {[
                        { label: 'Total Sections', value: '358' },
                        { label: 'IPC Redundant', value: '150+' },
                        { label: 'New Offenses', value: '23' },
                        { label: 'Accuracy', value: '99.9%' }
                    ].map((stat, i) => (
                        <div key={i} className="px-4">
                            <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">{stat.label}</div>
                            <div className="text-3xl font-black font-sans">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Results Diagram */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-2 h-2 bg-black"></div>
                        <h3 className="font-bold uppercase tracking-widest text-sm">Query Results</h3>
                        <div className="flex-1 h-[1px] bg-black/10"></div>
                    </div>

                    <AnimatePresence>
                        {filteredResults.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="group relative"
                            >
                                {/* Schematic Card */}
                                <div className="bg-white border border-black p-0 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0">

                                        {/* IPC Node */}
                                        <div className="p-8 border-b md:border-b-0 md:border-r border-black/10 relative overflow-hidden">
                                            <div className="absolute top-2 left-2 text-[10px] font-bold bg-black text-white px-1">IPC</div>
                                            <div className="flex flex-col h-full justify-center">
                                                <div className="text-xs uppercase text-slate-400 mb-1">IPC 1860</div>
                                                <div className="text-4xl font-black">{item.ipc}</div>
                                                <div className="text-[10px] font-mono mt-2 text-slate-400 truncate w-full">ID: {item.ipc.padStart(4, '0')}...</div>
                                            </div>
                                        </div>

                                        {/* Connector */}
                                        <div className="bg-[#F4F4F4] flex flex-col md:flex-row items-center justify-center p-4 gap-2 relative z-10">
                                            <div className="hidden md:block w-8 h-[1px] bg-black"></div>
                                            <div className="w-8 h-8 rounded-full border border-black bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <MoveRight size={14} className="md:block hidden" />
                                                <CornerDownRight size={14} className="md:hidden block" />
                                            </div>
                                            <div className="hidden md:block w-8 h-[1px] bg-black"></div>
                                        </div>

                                        {/* BNS Node & Info */}
                                        <div className="p-8 border-t md:border-t-0 md:border-l border-black/10 bg-white relative">
                                            <div className="absolute top-2 right-2 text-[10px] font-bold border border-black px-1">BNS</div>

                                            <div className="grid md:grid-cols-[auto_1fr] gap-8">
                                                <div>
                                                    <div className="text-xs uppercase text-slate-400 mb-1">BNS 2023</div>
                                                    <div className="text-4xl font-black text-black">{item.bns}</div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-lg leading-tight uppercase relative inline-block">
                                                        {item.title}
                                                        <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-black/20"></span>
                                                    </h4>
                                                    <p className="text-xs font-mono text-slate-600 leading-relaxed border-l border-black pl-3">
                                                        {item.change}
                                                    </p>
                                                    {item.keralaCases && (
                                                        <div className="mt-2 flex gap-2 items-start opacity-70">
                                                            <BookOpen size={12} className="mt-0.5" />
                                                            <p className="text-[10px] font-mono">{item.keralaCases}</p>
                                                        </div>
                                                    )}

                                                    {/* AI Analysis Button & Content */}
                                                    <div className="pt-4 border-t border-black/10 mt-4">
                                                        <button
                                                            onClick={() => handleExplain(item)}
                                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white px-3 py-2 border border-black transition-colors"
                                                        >
                                                            <Sparkles size={12} />
                                                            {explanation.id === item.ipc && explanation.loading ? 'ANALYZING...' :
                                                                explanation.id === item.ipc ? 'CLOSE ANALYSIS' : 'EXPLAIN WITH AI'}
                                                        </button>

                                                        <AnimatePresence>
                                                            {explanation.id === item.ipc && !explanation.loading && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="mt-4 p-4 bg-black/5 border border-black/10 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                                                                        <div className="flex items-center gap-2 mb-2 text-black font-bold">
                                                                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
                                                                            AI INSIGHTS
                                                                        </div>
                                                                        {explanation.text}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredResults.length === 0 && (
                        <div className="border-2 border-dashed border-black/20 p-12 text-center font-mono">
                            <p className="mb-2">ERR: NO_DATA_FOUND</p>
                            <p className="text-xs text-slate-400">Try adjusting search parameters.</p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default BNSConverter;
