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
const geminiService = require('./gemini-service');

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
      // Constitutional Law Questions
      {
        id: 1,
        topic: 'constitutional',
        question: 'What year was the U.S. Constitution ratified?',
        options: ['1776', '1787', '1791', '1795'],
        correctAnswer: 1
      },
      {
        id: 2,
        topic: 'constitutional',
        question: 'How many amendments are in the Bill of Rights?',
        options: ['5', '8', '10', '15'],
        correctAnswer: 2
      },
      {
        id: 3,
        topic: 'constitutional',
        question: 'Which branch has the power to interpret laws?',
        options: ['Legislative', 'Executive', 'Judicial', 'Administrative'],
        correctAnswer: 2
      },
      {
        id: 4,
        topic: 'jurisprudence',
        question: 'Who gave the definition "law is the command of the sovereign backed by sanction"?',
        options: ['H.L.A. Hart', 'John Austin', 'Lon Fuller', 'Ronald Dworkin'],
        correctAnswer: 1
      },
      {
        id: 5,
        topic: 'constitutional',
        question: 'Who put forward the idea of a Constituent Assembly for India?',
        options: ['M.N. Roy', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Sardar Patel'],
        correctAnswer: 0
      },
      {
        id: 6,
        topic: 'constitutional',
        question: 'Which amendment is known as the "Mini Constitution"?',
        options: ['42nd Amendment', '44th Amendment', '52nd Amendment', '61st Amendment'],
        correctAnswer: 0
      },
      {
        id: 7,
        topic: 'constitutional',
        question: 'When was the 42nd Amendment enacted?',
        options: ['1975', '1976', '1977', '1978'],
        correctAnswer: 1
      },
      {
        id: 24,
        topic: 'constitutional',
        question: 'Which of the following writs is issued for quashing an order that is already passed by a subordinate Court, tribunal or a quasi-judicial authority?',
        options: ['Mandamus', 'Certiorari', 'Prohibition', 'Quo Warranto'],
        correctAnswer: 1
      },

      // Criminal Law Questions
      {
        id: 8,
        topic: 'criminal',
        question: 'Who has the burden to prove the accused falls under a General Exception in the BNS?',
        options: ['Prosecution', 'Defence', 'Accused', 'Judge'],
        correctAnswer: 2
      },
      {
        id: 9,
        topic: 'criminal',
        question: 'What is the general rule for a child under 7 years?',
        options: ['Can be guilty if mature', 'Can be guilty if under 12', 'Not criminally liable for any offense', 'Presumed to be guilty'],
        correctAnswer: 2
      },
      {
        id: 10,
        topic: 'criminal',
        question: 'Under Section 23 of BNS, when is intoxication not a defense?',
        options: ['Voluntary intoxication', 'Intoxication caused by medication', 'Without the knowledge of the accused', 'When the intoxication was due to accident'],
        correctAnswer: 0
      },
      {
        id: 23,
        topic: 'criminal',
        question: 'A man is defined by Section 10 of Indian Penal Code as a male human being of',
        options: ['Any age', 'Above 18 years of age', 'Above 16 years of age', 'Above 21 years of age'],
        correctAnswer: 0
      },
      {
        id: 29,
        topic: 'criminal',
        question: 'As per Sec. 320 of IPC, how many kinds of hurts are included under Grievous Hurt?',
        options: ['6', '7', '8', '5'],
        correctAnswer: 2
      },
      {
        id: 30,
        topic: 'criminal',
        question: 'Extortion is defined under which Section of IPC, 1860?',
        options: ['Sec. 384', 'Sec. 383', 'Sec. 390', 'Sec. 387'],
        correctAnswer: 1
      },
      {
        id: 31,
        topic: 'criminal',
        question: 'The Capital Punishment represents the following objective',
        options: ['Retribution', 'Reformation', 'Rehabilitation', 'Self-Expiation'],
        correctAnswer: 0
      },
      {
        id: 32,
        topic: 'criminal',
        question: 'Define the term Actus Reus in one sentence.',
        options: ['The guilty mind or mental element of a crime.', 'The physical act, conduct, or unlawful omission that constitutes the crime.', 'The justification or excuse for committing a crime.', 'The final judgment passed by a court in a criminal case.'],
        correctAnswer: 1
      },
      {
        id: 33,
        topic: 'criminal',
        question: 'What is the literal meaning of Mens Rea, and why is it a fundamental principle?',
        options: ['"Guilty Act"; it ensures a physical action is punished.', '"Guilty Mind"; it ensures punishment is only for those with a blameworthy mental state.', '"Body of the Crime"; it is the first thing police must prove.', '"Statutory Law"; it allows for strict liability offences.'],
        correctAnswer: 1
      },
      {
        id: 34,
        topic: 'criminal',
        question: 'Section 34 IPC (corresponding to BNS) deals with acts done:',
        options: ['In furtherance of common object of an unlawful assembly', 'By several persons in furtherance of common intention', 'By conspiracy between two or more persons', 'Through abetment'],
        correctAnswer: 1
      },
      {
        id: 35,
        topic: 'criminal',
        question: 'The key distinction between common intention (Section 34) and common object (Section 149) is:',
        options: ['Common intention requires 5 or more persons', 'Common intention can exist with any number, common object requires 5+ in unlawful assembly', 'Common object requires pre-concert, common intention doesn\'t', 'Only common object applies to murder cases'],
        correctAnswer: 1
      },
      {
        id: 36,
        topic: 'criminal',
        question: 'In which case did the Supreme Court lay down that for Section 34, there must be a prior meeting of minds?',
        options: ['R. v. Dudley and Stephens', 'Mahboob Shah v. Emperor', 'K.M. Nanavati v. State of Maharashtra', 'State of Maharashtra v. Prabhakar Pandurang'],
        correctAnswer: 1
      },
      {
        id: 37,
        topic: 'criminal',
        question: 'Criminal conspiracy under Section 120A IPC requires:',
        options: ['Overt act in pursuance of agreement', 'Agreement between two or more persons to do illegal act or legal act by illegal means', 'Successful commission of the offence', 'Physical meeting of conspirators'],
        correctAnswer: 1
      },
      {
        id: 38,
        topic: 'criminal',
        question: 'In BNS, community service is introduced as a punishment for:',
        options: ['All first-time offenders', 'Certain petty offences', 'Juveniles only', 'Economic offences only'],
        correctAnswer: 1
      },

      // Contract Law Questions
      {
        id: 11,
        topic: 'contract',
        question: 'Under Section 2(h) of the Indian Contract Act, how is a contract defined?',
        options: ['An agreement between two or more persons.', 'A promise made in writing.', 'An agreement enforceable by law.', 'Any proposal that is accepted.'],
        correctAnswer: 2
      },
      {
        id: 12,
        topic: 'contract',
        question: 'Which two elements must be present to form an "Agreement"?',
        options: ['Proposal (Offer) and Acceptance.', 'Consideration and Free Consent.', 'Legal intention and Capacity.', 'Enforceability and Writing.'],
        correctAnswer: 0
      },
      {
        id: 13,
        topic: 'contract',
        question: 'The landmark case of Balfour v. Balfour (1919) established that:',
        options: ['Husbands must always pay maintenance to wives.', 'Social or domestic arrangements do not intend to create legal obligations.', 'Verbal contracts are void.', 'Acceptance must be communicated in writing.'],
        correctAnswer: 1
      },
      {
        id: 26,
        topic: 'contract',
        question: 'What does the Latin term consensus ad idem signify in contract law?',
        options: ['A contract must have a lawful object.', 'The parties must agree on the same thing in the same sense.', 'Consideration must be paid in cash.', 'An agreement is void if it is against public policy.'],
        correctAnswer: 1
      },
      {
        id: 39,
        topic: 'contract',
        question: 'In Carlill v. Carbolic Smoke Ball Co. (1893), the advertisement was held to be:',
        options: ['A specific offer to Mrs Carlill.', 'An invitation to treat (offer to chaffer).', 'A general offer to the public at large.', 'A counter-offer.'],
        correctAnswer: 2
      },
      {
        id: 40,
        topic: 'contract',
        question: 'What is the effect of a counter-offer on the original offer?',
        options: ['It accepts the original offer with conditions.', 'It terminates the original offer.', 'It makes the original offer irrevocable.', 'It has no legal effect until accepted in writing.'],
        correctAnswer: 1
      },
      {
        id: 41,
        topic: 'contract',
        question: 'According to the "Postal Rule," communication of acceptance is complete against the proposer when:',
        options: ['The proposer receives the letter.', 'The proposer reads the letter.', 'The letter is put in the course of transmission (posted).', 'The offeree signs the letter.'],
        correctAnswer: 2
      },
      {
        id: 42,
        topic: 'contract',
        question: 'In Harvey v. Facey, a telegram stating "Lowest price for Bumper Hall Pen is £900" was considered:',
        options: ['A binding offer.', 'An invitation to make an offer.', 'A valid acceptance.', 'A specific offer.'],
        correctAnswer: 1
      },
      {
        id: 43,
        topic: 'contract',
        question: 'The ruling in Mohori Bibi v. Dharmadas Ghose established that a minor\'s agreement is:',
        options: ['Voidable at the minor\'s option.', 'Valid if it is for the minor\'s benefit.', 'Void ab initio (void from the beginning).', 'Enforceable after the minor turns 18.'],
        correctAnswer: 2
      },
      {
        id: 44,
        topic: 'contract',
        question: 'Under Section 68, if a person supplies "necessaries" to a minor:',
        options: ['The minor is personally liable to pay.', 'The minor\'s property is liable for reimbursement.', 'No recovery is possible because the agreement is void.', 'The minor\'s parents are always liable.'],
        correctAnswer: 1
      },
      {
        id: 45,
        topic: 'contract',
        question: 'In India, consideration for a promise may move from:',
        options: ['Only the promisee.', 'Only the promisor.', 'The promisee or any other person.', 'Only a legal guardian.'],
        correctAnswer: 2
      },
      {
        id: 46,
        topic: 'contract',
        question: 'The "Peppercorn Theory" relates to the principle that:',
        options: ['Consideration must be adequate in value.', 'Consideration need not be adequate, but must be of some value.', 'Contracts without written consideration are void.', 'Consideration must always be in cash.'],
        correctAnswer: 1
      },
      {
        id: 47,
        topic: 'contract',
        question: '"Coercion" under Section 15 involves:',
        options: ['Dominating the will of a person in a fiduciary relationship.', 'Threatening to commit an act forbidden by the Indian Penal Code.', 'Making a false statement innocently.', 'Remaining silent when there is a duty to speak.'],
        correctAnswer: 1
      },
      {
        id: 48,
        topic: 'contract',
        question: 'A "Wagering Agreement" (betting) is legally:',
        options: ['Valid and enforceable.', 'Void.', 'Voidable at the option of the loser.', 'Illegal and punishable by imprisonment in all states.'],
        correctAnswer: 1
      },
      {
        id: 49,
        topic: 'contract',
        question: 'The "Doctrine of Blue Pencil" allows a court to:',
        options: ['Cancel a contract written in the wrong ink.', 'Sever and delete illegal parts of a contract while enforcing legal parts.', 'Rewrite the terms of a contract to make them fair.', 'Grant an injunction against a minor.'],
        correctAnswer: 1
      },
      {
        id: 50,
        topic: 'contract',
        question: 'The "Doctrine of Frustration" (Section 56) applies when:',
        options: ['One party refuses to perform the contract.', 'Performance becomes impossible due to an external, unforeseen event.', 'There is a minor delay in performance.', 'The parties have a disagreement over the price.'],
        correctAnswer: 1
      },
      {
        id: 51,
        topic: 'contract',
        question: 'What is the meaning of the legal term Quantum Meruit?',
        options: ['Something for something.', 'As much as earned.', 'Let the buyer beware.', 'An act of God.'],
        correctAnswer: 1
      },
      {
        id: 52,
        topic: 'contract',
        question: 'The measure of damages for breach of contract was famously established in:',
        options: ['Hadley v. Baxendale.', 'Lalman v. Gauri Dutt.', 'Felthouse v. Bindley.', 'Derry v. Peek.'],
        correctAnswer: 0
      },
      {
        id: 53,
        topic: 'contract',
        question: 'Under the Specific Relief Act, 1963, a "Mandatory Injunction" is used to:',
        options: ['Prevent a person from filing a lawsuit.', 'Compel the performance of certain acts to prevent a breach.', 'Stop a contract from being signed.', 'Cancel a minor\'s property rights.'],
        correctAnswer: 1
      },
      {
        id: 54,
        topic: 'contract',
        question: 'Section 6 of the Specific Relief Act provides a summary remedy for:',
        options: ['Breach of a marriage promise.', 'Unlawful dispossession of immovable property.', 'Recovery of lost movable goods.', 'Fraudulent misrepresentation.'],
        correctAnswer: 1
      },
      {
        id: 55,
        topic: 'contract',
        question: 'What is the essential element of a valid contract?',
        options: ['Offer and Acceptance', 'Consideration', 'Intention to create legal relations', 'All of the above'],
        correctAnswer: 3
      },
      {
        id: 56,
        topic: 'contract',
        question: 'A contract entered into by a minor is:',
        options: ['Void', 'Voidable', 'Valid', 'Illegal'],
        correctAnswer: 0
      },
      {
        id: 57,
        topic: 'contract',
        question: 'What is the doctrine of "Caveat Emptor"?',
        options: ['Let the buyer beware', 'Let the seller beware', 'Let both parties beware', 'None of the above'],
        correctAnswer: 0
      },
      {
        id: 58,
        topic: 'contract',
        question: 'When the Communication of a proposal is complete',
        options: ['When it do not comes to the knowledge of the person to whom it is made', 'When it comes to the knowledge of the another person that some communication was made to the concerned person', 'When it comes to the knowledge of the person to whom it is not made', 'When it comes to the knowledge of the person to whom it is made'],
        correctAnswer: 3
      },

      // Property Law Questions
      {
        id: 14,
        topic: 'property',
        question: 'What is the Transfer of Property Act year?',
        options: ['1872', '1882', '1892', '1902'],
        correctAnswer: 1
      },
      {
        id: 15,
        topic: 'property',
        question: 'What is the minimum age to transfer property?',
        options: ['18 years', '21 years', 'No minimum age', '16 years'],
        correctAnswer: 0
      },
      {
        id: 16,
        topic: 'property',
        question: 'What is "Easement" in property law?',
        options: ['Right to use another\'s property', 'Right to sell property', 'Right to lease property', 'Right to inherit property'],
        correctAnswer: 0
      },

      // Family Law Questions
      {
        id: 17,
        topic: 'family',
        question: 'Under Hindu Marriage Act, what is the minimum age for marriage for a bride?',
        options: ['16 years', '18 years', '21 years', '25 years'],
        correctAnswer: 1
      },
      {
        id: 18,
        topic: 'family',
        question: 'What is "Maintenance" in family law?',
        options: ['Financial support', 'Property division', 'Child custody', 'Divorce proceedings'],
        correctAnswer: 0
      },
      {
        id: 19,
        topic: 'family',
        question: 'Under which act is adoption governed in India?',
        options: ['Hindu Adoption and Maintenance Act', 'Guardians and Wards Act', 'Both A and B', 'None of the above'],
        correctAnswer: 2
      },

      // Jurisprudence Questions
      {
        id: 20,
        topic: 'jurisprudence',
        question: '_________ observes, "law must be stable, yet it cannot stand still".',
        options: ['Holland', 'Roscoe Pound', 'Salmond', 'Allen'],
        correctAnswer: 1
      },
      {
        id: 21,
        topic: 'jurisprudence',
        question: 'Who said that "customs are of the main triangles of the laws of England"?',
        options: ['Sir Edward Coke', 'Sir Thomas Fleming', 'Sir William Hankford', 'Sir Robert Hyde'],
        correctAnswer: 0
      },
      {
        id: 22,
        topic: 'jurisprudence',
        question: 'The doctrine of prospective overruling was laid down by Justice Cardozo in',
        options: ['Gerard v. Worth of Paris Ltd.', 'Northern Railway v. Sunburst Oil Refining Co.', 'Tiverton Estates Ltd. v. Wearwell Ltd.', 'Baba Narayan Lakras v. Saboosa'],
        correctAnswer: 1
      },

      // Tort Law Questions
      {
        id: 25,
        topic: 'tort',
        question: '"Tort means a civil wrong which is not exclusively a breach of contract or breach of Trust." This definition is from which statute?',
        options: ['The Specific Relief Act', 'The Limitation Act', 'The Indian Contract Act', 'None of the above'],
        correctAnswer: 1
      },

      // Cyber Law Questions
      {
        id: 27,
        topic: 'cyber',
        question: 'Who can appoint the Controller of Certifying Authorities under Information Technology Act, 2000?',
        options: ['The Central Government', 'The State Government', 'Both A) and B)', 'None of the above'],
        correctAnswer: 0
      },
      {
        id: 28,
        topic: 'cyber',
        question: 'What is the punishment for tempering with computer resource documents under Information Technology Act?',
        options: ['Imprisonment upto three years or with fine which may extend upto two lakh rupees or with both', 'Imprisonment upto two years or with fine which may extend upto one lakh rupees or with both', 'Imprisonment upto one year or with fine which may extend upto one lakh rupees or with both', 'Imprisonment upto five years or with fine which may extend upto five lakh rupees or with both'],
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

// Get all questions (with optional topic filter)
app.get('/api/questions', (req, res) => {
  const { topic } = req.query;
  const allQuestions = quizzes.flatMap(quiz => quiz.questions);

  // Filter by topic if provided
  if (topic && topic !== 'all') {
    const filteredQuestions = allQuestions.filter(q => q.topic === topic);
    console.log(`Filtering questions for topic: ${topic}, found: ${filteredQuestions.length} questions`);
    return res.json(filteredQuestions);
  }

  // Return all questions
  console.log(`Returning all questions: ${allQuestions.length} questions`);
  res.json(allQuestions);
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
              { title: 'Law Of Contracts 1 - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Law Of Contracts 1-Anil K Nair.pdf` }
            ],
            previousQns: [
              { title: '2023 Previous Year Paper - CP01', url: `${req.protocol}://${req.get('host')}/public/notes/2023 Previous Year Paper- CP01.pdf` },
              { title: '2022 Previous Year Paper - CP01', url: `${req.protocol}://${req.get('host')}/public/notes/2022 Previous Year Paper - CP01.pdf` }
            ]
          }
        },
        {
          id: 'torts',
          name: 'Law of Torts',
          resources: {
            notes: [{ title: 'Law of Torts - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Law of Torts -Anil K Nair.pdf` }],
            previousQns: [
              { title: '2023 Previous Year Paper - CP02', url: `${req.protocol}://${req.get('host')}/public/notes/2023 Previous Year Paper- CP02.pdf` },
              { title: '2022 Previous Year Paper - CP02', url: `${req.protocol}://${req.get('host')}/public/notes/2022 Previous Year Paper- CP02.pdf` }
            ]
          }
        },
        {
          id: 'consti1',
          name: 'Constitutional Law 1',
          resources: {
            notes: [{ title: 'Constitutional_Law_1.pdf', url: `${req.protocol}://${req.get('host')}/public/notes/Constitutional_Law_1.pdf` }],
            previousQns: [
              { title: '2023 Previous Year Paper - CP03', url: `${req.protocol}://${req.get('host')}/public/notes/2023 Previous Year Paper- CP03.pdf` },
              { title: '2022 Previous Year Paper - CP03', url: `${req.protocol}://${req.get('host')}/public/notes/2022 Previous Year Paper- CP03.pdf` }
            ]
          }
        },
        {
          id: 'family1',
          name: 'Family Law 1',
          resources: {
            notes: [{ title: 'Family Law 1 - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Family Law 1 -Anil K Nair.pdf` }],
            previousQns: [
              { title: '2023 Previous Year Paper - CP04', url: `${req.protocol}://${req.get('host')}/public/notes/2023 Previous Year Paper- CP04.pdf` },
              { title: '2022 Previous Year Paper - CP04', url: `${req.protocol}://${req.get('host')}/public/notes/2022 Previous Year Paper- CP04.pdf` }
            ]
          }
        },
        {
          id: 'crimes1',
          name: 'Law of Crimes 1',
          resources: {
            notes: [{ title: 'BNS - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/BNS ANIL K NAIR.pdf` }],
            previousQns: [
              { title: '2023 Previous Year Paper - CP05', url: `${req.protocol}://${req.get('host')}/public/notes/2023 Previous Year Paper- CP05.pdf` },
              { title: '2022 Previous Year Paper - CP05', url: `${req.protocol}://${req.get('host')}/public/notes/2022 Previous Year Paper- CP05.pdf` }
            ]
          }
        },
        {
          id: 'legal_lang',
          name: 'Legal Language and Legal Writing',
          resources: {
            notes: [{ title: 'Legal Language & Legal Writing - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Legal Language & Legal Writing-Anil K Nair.pdf` }],
            previousQns: [
              { title: '2023 Previous Year Paper - OP1', url: `${req.protocol}://${req.get('host')}/public/notes/2023 Previous Year Paper- OP01.pdf` },
              { title: '2022 Previous Year Paper - OP1', url: `${req.protocol}://${req.get('host')}/public/notes/2022 Previous Year Paper- OP01.pdf` }
            ]
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

    // Try Gemini AI first if API Key is configured
    try {
      if (process.env.GEMINI_API_KEY) {
        console.log('Using Gemini AI for chat...');
        const response = await geminiService.sendMessage(message, chatHistory);
        return res.json({
          message: 'Success',
          response: response,
          timestamp: new Date().toISOString(),
          provider: 'gemini'
        });
      }
    } catch (geminiError) {
      console.error('Gemini AI failed, falling back to Mock AI:', geminiError.message);
      // Fallback to Mock AI continues below...
    }

    console.log('Using Mock Legal AI (Offline mode)...');
    // Send message to Mock Legal AI
    const response = await mockLegalAI.sendMessage(message);

    res.json({
      message: 'Success',
      response: response,
      timestamp: new Date().toISOString(),
      provider: 'mock-ai'
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