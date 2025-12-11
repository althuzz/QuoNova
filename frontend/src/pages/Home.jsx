import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Scale, Gavel, BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const Home = () => {
    return (
        <motion.div
            className="max-w-6xl mx-auto relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            {/* Modern Hero Section with Creative Layout */}
            <div className="relative px-4 pt-12 pb-24">
                {/* Left Side - Headline */}
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-warm-brown-100 rounded-full mb-6"
                        >
                            <div className="w-2 h-2 bg-warm-brown-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-warm-brown-700 uppercase tracking-wider">BNS 2023 Updated</span>
                        </motion.div>

                        <h1 className="mb-6">
                            <div className="text-sm font-bold text-warm-brown-600 uppercase tracking-[0.3em] mb-3">Master the</div>
                            <div className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.85] mb-2">
                                LAWS OF
                            </div>
                            <div className="text-6xl md:text-8xl font-black tracking-tight leading-[0.85]">
                                THE <span className="text-warm-brown-500">LAND</span>
                            </div>
                        </h1>

                        <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                            The ultimate platform for legal aspirants. Test your knowledge, access vital legal notes, and climb the judicial ranks.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/quiz">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                                >
                                    <span>Start Quiz</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </motion.button>
                            </Link>
                            <Link to="/notes">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all"
                                >
                                    Browse Notes
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Side - Creative Visual Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative h-[500px] hidden lg:block"
                    >
                        {/* Card 1 - Constitutional Law */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotate: -3 }}
                            animate={{ opacity: 1, y: 0, rotate: -3 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
                            className="absolute top-0 left-0 w-64 h-72 bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-6 shadow-2xl cursor-pointer"
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                        <Scale className="text-white" size={24} />
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-2">Constitutional Law</h3>
                                    <p className="text-white/70 text-sm">Fundamental rights & duties</p>
                                </div>
                                <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
                                    <span>Explore</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2 - Criminal Law */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotate: 3 }}
                            animate={{ opacity: 1, y: 0, rotate: 3 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
                            className="absolute top-16 right-0 w-64 h-72 bg-gradient-to-br from-warm-brown-500 to-warm-brown-700 rounded-3xl p-6 shadow-2xl cursor-pointer"
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                        <Gavel className="text-white" size={24} />
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-2">Criminal Law</h3>
                                    <p className="text-white/70 text-sm">IPC, CrPC & Evidence Act</p>
                                </div>
                                <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
                                    <span>Explore</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3 - Legal Resources */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotate: -2 }}
                            animate={{ opacity: 1, y: 0, rotate: -2 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
                            className="absolute bottom-0 left-12 w-64 h-72 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl cursor-pointer"
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                                        <BookMarked className="text-slate-900" size={24} />
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-xl mb-2">Legal Resources</h3>
                                    <p className="text-slate-600 text-sm">Curated notes & case studies</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-900 text-sm font-semibold">
                                    <span>Explore</span>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-8 -right-8 w-24 h-24 border-4 border-warm-brown-200 rounded-full opacity-30"
                        />
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-4 -left-4 w-16 h-16 bg-slate-900 rounded-2xl opacity-10"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <motion.div
                variants={containerVariants}
                className="grid md:grid-cols-3 gap-6 mt-16 px-4"
            >
                <FeatureCard
                    icon={<Scale className="text-slate-900" size={28} />}
                    title="Daily Quizzes"
                    description="Challenge yourself with updated constitutional and criminal law questions."
                />
                <FeatureCard
                    icon={<BookOpen className="text-slate-900" size={28} />}
                    title="Legal Notes"
                    description="Download curated PDF notes for quick revision and deep dives."
                />
                <FeatureCard
                    icon={<Award className="text-slate-900" size={28} />}
                    title="Rank System"
                    description="Progress from Student to Chief Justice as you earn points."
                />
            </motion.div>

            {/* Dedication Section */}
            <motion.div
                variants={itemVariants}
                className="mt-20 text-center pb-10"
            >
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-8"></div>
                <p className="text-xs font-bold text-slate-400 tracking-[0.3em] uppercase opacity-70">
                    Dedicated to <span className="text-slate-800 font-black">3/1A GLCT</span>
                </p>
            </motion.div>
        </motion.div >
    );
};

const FeatureCard = ({ icon, title, description }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-900">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-warm-brown-600 leading-relaxed">{description}</p>
        </motion.div>
    );
};

export default Home;
