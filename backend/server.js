const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const path = require('path');
const mockLegalAI = require('./mock-legal-ai');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// In-memory database (replace with MongoDB in production)
let users = [
  {
    id: 1,
    username: 'lawstudent',
    email: 'student@example.com',
    // Hash the seeded password at runtime so the known credential "law123" works
    password: bcrypt.hashSync('law123', 10),
    scores: [
      { quizId: 1, score: 850, date: '2024-12-01' },
      { quizId: 1, score: 920, date: '2024-12-05' }
    ],
    createdAt: '2024-11-20'
  }
];

// Sample quiz data
const quizzes = [
  {
    id: 1,
    title: 'Basic Law Quiz',
    questions: [
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
      },
      {
        id: 3,
        question: 'Which branch has the power to interpret laws?',
        options: ['Legislative', 'Executive', 'Judicial', 'Administrative'],
        correctAnswer: 2
      },
      {
        id: 4,
        question: 'Who gave the definition "law is the command of the sovereign backed by sanction"?',
        options: ['H.L.A. Hart', 'John Austin', 'Lon Fuller', 'Ronald Dworkin'],
        correctAnswer: 1
      },
      {
        id: 5,
        question: 'Who put forward the idea of a Constituent Assembly for India?',
        options: ['M.N. Roy', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Sardar Patel'],
        correctAnswer: 0
      },
      {
        id: 6,
        question: 'Which amendment is known as the "Mini Constitution"?',
        options: ['42nd Amendment', '44th Amendment', '52nd Amendment', '61st Amendment'],
        correctAnswer: 0
      },
      {
        id: 7,
        question: 'When was the 42nd Amendment enacted?',
        options: ['1975', '1976', '1977', '1978'],
        correctAnswer: 1
      },
      {
        id: 8,
        question: 'Who has the burden to prove the accused falls under a General Exception in the BNS?',
        options: ['Prosecution', 'Defence', 'Accused', 'Judge'],
        correctAnswer: 2
      },
      {
        id: 9,
        question: 'What is the general rule for a child under 7 years?',
        options: ['Can be guilty if mature', 'Can be guilty if under 12', 'Not criminally liable for any offense', 'Presumed to be guilty'],
        correctAnswer: 2
      },
      {
        id: 10,
        question: 'Under Section 23 of BNS, when is intoxication not a defense?',
        options: ['Voluntary intoxication', 'Intoxication caused by medication', 'Without the knowledge of the accused', 'When the intoxication was due to accident'],
        correctAnswer: 0
      }
    ]
  }
];

// Leaderboard data
let leaderboard = [
  { userId: 1, username: 'lawstudent', score: 920, date: '2024-12-05' },
  { userId: 2, username: 'legalpro', score: 880, date: '2024-12-04' },
  { userId: 3, username: 'constitution_expert', score: 780, date: '2024-12-03' }
];

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// =============== PUBLIC ROUTES ===============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Law Quiz API is running',
    version: '1.0.0',
    features: ['Authentication', 'Quiz', 'Leaderboard', 'User Profiles']
  });
});

// Get all questions
app.get('/api/questions', (req, res) => {
  const allQuestions = quizzes.flatMap(quiz => quiz.questions);
  res.json(allQuestions);
});

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  res.json(quizzes);
});

// Get specific quiz
app.get('/api/quizzes/:id', (req, res) => {
  const quiz = quizzes.find(q => q.id === parseInt(req.params.id, 10));
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  res.json(quiz);
});

// Get leaderboard (public)
app.get('/api/leaderboard', (req, res) => {
  const publicLeaderboard = leaderboard.slice(0, 10).map(entry => ({
    rank: leaderboard.indexOf(entry) + 1,
    username: entry.username,
    score: entry.score,
    date: entry.date
  }));
  res.json(publicLeaderboard);
});

// Get legal notes
app.get('/api/notes', (req, res) => {
  const semesters = [
    {
      id: 'sem1',
      title: '1st Semester',
      status: 'active',
      subjects: [
        {
          id: 'contracts',
          name: 'Law of Contracts',
          resources: {
            notes: [
              { title: 'Contract Basics & Formation', url: '#' },
              { title: 'Free Consent & Void Agreements', url: '#' }
            ],
            previousQns: [
              { title: '2023 Previous Year Paper', url: '#' },
              { title: '2022 Previous Year Paper', url: '#' }
            ]
          }
        },
        {
          id: 'torts',
          name: 'Law of Torts',
          resources: {
            notes: [{ title: 'Nature & Definition of Tort', url: '#' }],
            previousQns: [{ title: '2023 Previous Year Paper', url: '#' }]
          }
        },
        {
          id: 'consti1',
          name: 'Constitutional Law 1',
          resources: {
            notes: [{ title: 'Constitutional_Law_1.pdf', url: `${req.protocol}://${req.get('host')}/public/notes/Constitutional_Law_1.pdf` }],
            previousQns: [{ title: '2023 Previous Year Paper', url: '#' }]
          }
        },
        {
          id: 'family1',
          name: 'Family Law 1',
          resources: {
            notes: [{ title: 'Sources of Hindu Law', url: '#' }],
            previousQns: [{ title: '2023 Previous Year Paper', url: '#' }]
          }
        },
        {
          id: 'crimes1',
          name: 'Law of Crimes 1',
          resources: {
            notes: [{ title: 'General Exceptions (IPC/BNS)', url: '#' }],
            previousQns: [{ title: '2023 Previous Year Paper', url: '#' }]
          }
        },
        {
          id: 'legal_lang',
          name: 'Legal Language and Legal Writing',
          resources: {
            notes: [{ title: 'Legal Maxims & Terms', url: '#' }],
            previousQns: [{ title: '2023 Previous Year Paper', url: '#' }]
          }
        }
      ]
    },
    { id: 'sem2', title: '2nd Semester', status: 'coming_soon' },
    { id: 'sem3', title: '3rd Semester', status: 'coming_soon' },
    { id: 'sem4', title: '4th Semester', status: 'coming_soon' },
    { id: 'sem5', title: '5th Semester', status: 'coming_soon' },
    { id: 'sem6', title: '6th Semester', status: 'coming_soon' }
  ];
  res.json(semesters);
});

// Submit feedback
app.post('/api/feedback', (req, res) => {
  const { name, email, category, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newFeedback = {
    id: Date.now(),
    name,
    email,
    category,
    message,
    date: new Date().toISOString()
  };

  // Save to file
  const fs = require('fs');
  const path = require('path');
  const feedbackFile = path.join(__dirname, 'feedback.json');

  let feedbacks = [];
  if (fs.existsSync(feedbackFile)) {
    try {
      const data = fs.readFileSync(feedbackFile, 'utf8');
      feedbacks = JSON.parse(data);
    } catch (e) {
      console.error('Error reading feedback file:', e);
    }
  }

  feedbacks.push(newFeedback);

  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));
    console.log('d New Feedback Saved to feedback.json:', newFeedback);
    res.json({ message: 'Feedback received successfully. Thank you!' });
  } catch (e) {
    console.error('Error writing feedback file:', e);
    res.status(500).json({ message: 'Failed to save feedback' });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Send message to Mock Legal AI
    const response = await mockLegalAI.sendMessage(message);

    res.json({
      message: 'Success',
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to process chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Legacy submit quiz (for non-logged in users)
app.post('/api/submit-quiz', (req, res) => {
  const { name, quizId, score } = req.body;

  if (!name || !quizId || score === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newEntry = {
    userId: null, // No user ID for guest
    username: name,
    score,
    date: new Date().toISOString().split('T')[0]
  };

  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 50); // Keep top 50

  res.json({
    message: 'Score submitted successfully',
    entry: {
      rank: leaderboard.findIndex(e => e.username === name && e.score === score) + 1,
      name: name,
      score: score,
      date: newEntry.date
    }
  });
});

// =============== AUTHENTICATION ROUTES ===============

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      scores: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);

    // Create token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        scores: newUser.scores,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        scores: user.scores,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============== PROTECTED ROUTES ===============

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      scores: user.scores,
      createdAt: user.createdAt
    }
  });
});

// Submit quiz score (authenticated)
app.post('/api/auth/submit-quiz', authenticateToken, (req, res) => {
  const { quizId, score } = req.body;
  const userId = req.user.userId;

  if (!quizId || score === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find user
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Add score to user's history
  const newScore = {
    quizId,
    score,
    date: new Date().toISOString().split('T')[0]
  };

  user.scores.push(newScore);

  // Update leaderboard
  const leaderboardEntry = {
    userId: user.id,
    username: user.username,
    score,
    date: newScore.date
  };

  leaderboard.push(leaderboardEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 50); // Keep top 50

  res.json({
    message: 'Score submitted successfully',
    score: newScore,
    userScores: user.scores
  });
});

// Get user's score history
app.get('/api/auth/scores', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  res.json({ scores: user?.scores || [] });
});

// =============== ERROR HANDLING ===============

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET  /api/health',
      'GET  /api/questions',
      'GET  /api/quizzes',
      'GET  /api/leaderboard',
      'POST /api/submit-quiz (guest)',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/profile (protected)',
      'POST /api/auth/submit-quiz (protected)',
      'GET  /api/auth/scores (protected)'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Law Quiz Backend Server running on port ${PORT}`);
  console.log(`🔐 Authentication: Enabled`);
  console.log(`📚 Total Questions: ${quizzes[0].questions.length}`);
  console.log(`👤 Registered Users: ${users.length}`);
  console.log(`🏆 Leaderboard Entries: ${leaderboard.length}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📡 API Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/questions`);
  console.log(`   GET  http://localhost:${PORT}/api/leaderboard`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/submit-quiz (protected)`);
});