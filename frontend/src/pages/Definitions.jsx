import React, { useState } from 'react';
import { Search, BookOpen, Quote, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const definitionsData = [
    {
        term: "Quasi-Contract",
        scholars: [
            {
                name: "Dr. Jenks",
                quote: "A situation where law imposes an obligation similar to that of a true contract, although no contract has been entered into by the parties involved."
            },
            {
                name: "Salmond",
                quote: "There are certain obligations which are not in truth contractual in the sense of resting on agreement, but which the law treats as if they were."
            }
        ]
    }
];

const Definitions = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDefinitions = definitionsData.filter(item =>
        item.term.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F4F4F4] text-black font-mono selection:bg-black selection:text-white overflow-x-hidden relative">

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '64px 64px' }}
            />

            <div className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-24 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 text-slate-400 text-xs tracking-[0.2em] uppercase mb-4"
                    >
                        <span className="w-12 h-[1px] bg-black"></span>
                        <span>Legal / Scholarship / Lexicon</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8]">
                        LEGAL.<br />
                        <span className="outline-text text-transparent bg-clip-text" style={{ WebkitTextStroke: '2px black' }}>DEFINED.</span>
                    </h1>

                    {/* Search Input */}
                    <div className="relative max-w-lg group mt-12">
                        <div className="absolute -inset-2 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                        <div className="bg-white border-2 border-black p-1 flex items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                            <div className="px-4 text-black">
                                <Terminal size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search Terms..."
                                className="flex-1 bg-transparent border-none outline-none py-4 font-mono uppercase tracking-wide text-sm placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Definitions Grid */}
                <div className="grid gap-12">
                    <AnimatePresence>
                        {filteredDefinitions.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="group relative"
                            >
                                <div className="bg-white border-2 border-black p-8 md:p-12 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 relative overflow-hidden">

                                    {/* Decorative ID */}
                                    <div className="absolute top-0 right-0 p-4 font-mono text-xs text-slate-300 font-bold">
                                        DEF_{index.toString().padStart(3, '0')}
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-black mb-12 uppercase tracking-tight relative inline-block">
                                        {item.term}
                                        <div className="absolute -bottom-2 left-0 w-full h-[3px] bg-black"></div>
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                        {item.scholars.map((scholar, idx) => (
                                            <div key={idx} className="relative pl-8 border-l-2 border-black/10 hover:border-black transition-colors duration-300">
                                                <Quote size={24} className="absolute -left-3 -top-3 text-black bg-white p-1" />

                                                <blockquote className="text-lg md:text-xl font-medium leading-relaxed mb-6">
                                                    "{scholar.quote}"
                                                </blockquote>

                                                <div className="flex items-center gap-3">
                                                    <div className="h-[1px] w-8 bg-black"></div>
                                                    <cite className="font-bold uppercase tracking-widest text-sm not-italic">
                                                        {scholar.name}
                                                    </cite>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredDefinitions.length === 0 && (
                        <div className="border-2 border-dashed border-black/20 p-12 text-center font-mono">
                            <p className="mb-2">ERR: TERM_NOT_FOUND</p>
                            <p className="text-xs text-slate-400">Try searching for 'Quasi-Contract'</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Definitions;
