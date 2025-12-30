import React, { useState, useEffect } from 'react';
import { RotateCw, Award, ArrowLeft, Scale, Gavel, FileText, Home, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import FloatingLegalIcons from '../components/FloatingLegalIcons';

const Quiz = () => {
    const navigate = useNavigate();
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fallback questions
    const fallbackQuestions = [
        {
            id: 1,
            question: 'What year was the U.S. Constitution ratified?',
            options: ['1776', '1787', '1791', '1795'],
            correctAnswer: 1
        },
        {
            id: 2,
            question: 'How many amendments are in the Bill of Rights?',
            options: ['5', '8', '10', '15'],
            correctAnswer: 2
        }
    ];



    // Topic categories
    const topics = [
        { id: 'constitutional', name: 'Constitutional Law', icon: Scale, color: 'from-slate-900 to-slate-700', description: 'Fundamental rights & duties' },
        { id: 'criminal', name: 'Criminal Law', icon: Gavel, color: 'from-warm-brown-500 to-warm-brown-700', description: 'IPC, CrPC & Evidence Act' },
        { id: 'contract', name: 'Contract Law', icon: FileText, color: 'from-slate-800 to-slate-600', description: 'Agreements & obligations' },
        { id: 'tort', name: 'Tort Law', icon: Scale, color: 'from-warm-brown-700 to-warm-brown-900', description: 'Civil wrongs & liability' },
        { id: 'consumer_law', name: 'Consumer Law', icon: Users, color: 'from-slate-600 to-slate-800', description: 'Protections & Motor Vehicles Act' },
        { id: 'cyber', name: 'Cyber Law', icon: FileText, color: 'from-slate-500 to-slate-700', description: 'IT Act & digital crimes' },
        { id: 'property', name: 'Property Law', icon: Home, color: 'from-warm-brown-600 to-warm-brown-800', description: 'Real estate & ownership' },
        { id: 'family', name: 'Family Law', icon: Users, color: 'from-slate-700 to-slate-500', description: 'Marriage, divorce & inheritance' },
        { id: 'jurisprudence', name: 'Jurisprudence', icon: BookOpen, color: 'from-slate-600 to-slate-800', description: 'Legal theory & philosophy' },
        { id: 'all', name: 'All Topics', icon: BookOpen, color: 'from-warm-brown-400 to-warm-brown-600', description: 'Mixed questions from all areas' }
    ];

    useEffect(() => {
        if (!selectedTopic) return;

        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const topicParam = selectedTopic === 'all' ? '' : `?topic=${selectedTopic}`;
                const response = await fetch(`${API_URL}/api/questions${topicParam}`);
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                setQuestions(Array.isArray(data) ? data : [data]);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch questions:', error);
                setQuestions(fallbackQuestions);
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [selectedTopic]);

    const handleAnswer = (optionIndex) => {
        if (!questions.length) return;
        setSelectedOption(optionIndex);

        if (optionIndex === questions[currentQuestion].correctAnswer) {
            setScore(score + 100);
        }

        // Delay for visual feedback before next question
        setTimeout(() => {
            const nextQuestion = currentQuestion + 1;
            if (nextQuestion < questions.length) {
                setCurrentQuestion(nextQuestion);
                setSelectedOption(null);
            } else {
                setShowScore(true);
                // Fire and forget score submission (logic simplified for this demo)
                submitScore(score + (optionIndex === questions[currentQuestion].correctAnswer ? 100 : 0));
            }
        }, 1000);
    };

    const submitScore = (finalScore) => {
        // Guest submission for now, extended in future
        fetch(`${API_URL}/api/submit-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Guest Player', quizId: 1, score: finalScore })
        }).catch(console.error);
    };

    const restartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedOption(null);
        setSelectedTopic(null);
        setQuestions([]);
    };

    // Topic Selection Screen
    if (!selectedTopic) {
        return (
            <div className="max-w-6xl mx-auto relative px-4">
                <FloatingLegalIcons />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                        Choose Your <span className="text-warm-brown-500">Topic</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Select a legal area to test your knowledge</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {topics.map((topic, index) => {
                        const IconComponent = topic.icon;
                        return (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.03, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTopic(topic.id)}
                                className={`bg-gradient-to-br ${topic.color} rounded-3xl p-6 cursor-pointer shadow-lg hover:shadow-2xl transition-all`}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                        <IconComponent className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-2">{topic.name}</h3>
                                    <p className="text-white/80 text-sm mb-4 flex-grow">{topic.description}</p>
                                    <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
                                        <span>Start Quiz</span>
                                        <RotateCw size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto relative">
                <FloatingLegalIcons />

                {/* Back to Topics Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                        setSelectedTopic(null);
                        setQuestions([]);
                        setCurrentQuestion(0);
                        setScore(0);
                        setSelectedOption(null);
                    }}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Topics</span>
                </motion.button>

                <motion.div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="animate-spin text-slate-900 mb-4 rounded-full">
                        <RotateCw size={40} />
                    </div>
                    <p className="text-warm-brown-600 font-medium tracking-widest text-sm uppercase">Loading Questions...</p>
                </motion.div>
            </div>
        );
    }

    if (showScore) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center py-12 relative"
            >
                <div className="w-24 h-24 bg-slate-100 border border-slate-200 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Award size={48} />
                </div>
                <h2 className="text-4xl font-sans font-bold mb-2 text-slate-900 tracking-tight">Quiz Complete!</h2>
                <p className="text-warm-brown-600 mb-10 font-light">You have mastered this session.</p>

                <div className="text-7xl font-black text-slate-900 mb-10 tracking-tighter">
                    {score}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={restartQuiz} className="px-6 py-4 border border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        Play Again
                    </button>
                    <button onClick={() => navigate('/leaderboard')} className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">
                        View Leaderboard
                    </button>
                </div>
            </motion.div>
        );
    }

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Question {currentQuestion + 1} of {questions.length}</span>
                    <h2 className="text-2xl font-bold text-slate-900 font-sans mt-2 tracking-tight">
                        {topics.find(t => t.id === selectedTopic)?.name || 'Quiz'}
                    </h2>
                </div>
                <div className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold shadow-sm border border-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
                    {score} pts
                </div>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-slate-200 rounded-full mb-10 overflow-hidden">
                <motion.div
                    className="h-full bg-slate-900"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="bg-white p-8 mb-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden"
                >
                    <h3 className="text-2xl font-bold text-slate-900 leading-relaxed mb-8 font-sans relative z-10">
                        {currentQ?.question}
                    </h3>

                    <div className="space-y-4 relative z-10">
                        {currentQ?.options?.map((option, index) => {
                            let stateClass = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm";
                            let iconClass = "bg-slate-100 text-slate-500";
                            let textClass = "text-slate-700";

                            if (selectedOption !== null) {
                                if (index === currentQ.correctAnswer) {
                                    stateClass = "border-slate-900 bg-slate-50";
                                    iconClass = "bg-slate-900 text-white border-slate-900 font-bold";
                                    textClass = "text-slate-900 font-bold";
                                } else if (index === selectedOption) {
                                    stateClass = "border-red-200 bg-red-50";
                                    iconClass = "bg-red-500 text-white border-red-500";
                                    textClass = "text-red-900";
                                } else {
                                    stateClass = "border-slate-100 opacity-50";
                                }
                            }

                            return (
                                <motion.button
                                    key={index}
                                    whileHover={selectedOption === null ? { scale: 1.01, x: 4 } : {}}
                                    whileTap={selectedOption === null ? { scale: 0.99 } : {}}
                                    disabled={selectedOption !== null}
                                    onClick={() => handleAnswer(index)}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 font-medium group ${stateClass}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all shadow-inner ${iconClass}`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className={`text-lg transition-colors ${textClass}`}>{option}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="text-center">
                <button
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors uppercase tracking-widest hover:tracking-[0.2em] duration-300"
                    onClick={() => {
                        const nextQ = currentQuestion + 1;
                        if (nextQ < questions.length) setCurrentQuestion(nextQ);
                        else setShowScore(true);
                    }}
                >
                    Skip Question
                </button>
            </div>
        </div>
    );
};

export default Quiz;
