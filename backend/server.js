const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
console.log('DEBUG ENV GEMINI_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
console.log('DEBUG ENV PWD:', process.cwd());

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
      },

      // Torts Questions
      {
        id: 501,
        topic: 'tort',
        question: 'The word "Tort" is derived from which Latin term?',
        options: ['Tortum', 'Tortuous', 'Torts', 'Turpitude'],
        correctAnswer: 0
      },
      {
        id: 502,
        topic: 'tort',
        question: 'According to Salmond, a tort is a civil wrong for which the remedy is an action for:',
        options: ['Liquidated damages', 'Unliquidated damages', 'Criminal punishment', 'Specific performance'],
        correctAnswer: 1
      },
      {
        id: 503,
        topic: 'tort',
        question: 'Which maxim means "infringement of a legal right without any actual loss or damage"?',
        options: ['Damnum sine injuria', 'Injuria sine damno', 'Volenti non fit injuria', 'Res ipsa loquitur'],
        correctAnswer: 1
      },
      {
        id: 504,
        topic: 'tort',
        question: 'In which case was the maxim Injuria sine damno first prominently applied?',
        options: ['Gloucester Grammar School case', 'Ashby v. White', 'Rylands v. Fletcher', 'Donoghue v. Stevenson'],
        correctAnswer: 1
      },
      {
        id: 505,
        topic: 'tort',
        question: 'The Gloucester Grammar School case (1410) is a leading example of:',
        options: ['Injuria sine damno', 'Vicarious liability', 'Damnum sine injuria', 'Strict liability'],
        correctAnswer: 2
      },
      {
        id: 506,
        topic: 'tort',
        question: 'Who is a prominent supporter of the "Pigeon-hole Theory"?',
        options: ['Winfield', 'Salmond', 'Fraser', 'Pollock'],
        correctAnswer: 1
      },
      {
        id: 507,
        topic: 'tort',
        question: 'Winfield\'s view on the Law of Torts is often summarized as:',
        options: ['There is no law of tort, only a law of torts', 'All injuries done to another are torts unless there is some justification', 'Torts are limited to specific labeled categories', 'Tortious liability arises only from breach of contract'],
        correctAnswer: 1
      },
      {
        id: 508,
        topic: 'tort',
        question: 'Which maxim translates to "to a willing person, no injury is done"?',
        options: ['Respondeat superior', 'Qui facit per alium facit per se', 'Volenti non fit injuria', 'Ex turpi causa non oritur actio'],
        correctAnswer: 2
      },
      {
        id: 509,
        topic: 'tort',
        question: 'Mere knowledge of a danger does not necessarily imply consent to the risk. This is expressed as:',
        options: ['Scienti non fit injuria', 'Res ipsa loquitur', 'Vis Major', 'Damnum sine injuria'],
        correctAnswer: 0
      },
      {
        id: 510,
        topic: 'tort',
        question: '"Act of God" is also known by the Latin term:',
        options: ['Vis Major', 'Inevitable Accident', 'Novus actus interveniens', 'Volenti non fit injuria'],
        correctAnswer: 0
      },
      {
        id: 511,
        topic: 'tort',
        question: 'For the defence of "Inevitable Accident" to apply, the defendant must prove:',
        options: ['The injury was caused by natural forces', 'The accident could not have been avoided by reasonable care', 'The plaintiff consented to the risk', 'The act was authorized by a statute'],
        correctAnswer: 1
      },
      {
        id: 512,
        topic: 'tort',
        question: 'The maxim "Necessitas non habet legem" relates to which defence?',
        options: ['Private Defence', 'Statutory Authority', 'Necessity', 'Mistake'],
        correctAnswer: 2
      },
      {
        id: 513,
        topic: 'tort',
        question: 'Which maxim forms the basis of vicarious liability, meaning "let the principal be liable"?',
        options: ['Qui facit per alium facit per se', 'Respondeat superior', 'Actio personalis moritur cum persona', 'Injuria sine damno'],
        correctAnswer: 1
      },
      {
        id: 514,
        topic: 'tort',
        question: 'A master is vicariously liable for the acts of a servant if the act is committed:',
        options: ['Outside the course of employment', 'During a "private frolic"', 'In the course of employment', 'By an independent contractor'],
        correctAnswer: 2
      },
      {
        id: 515,
        topic: 'tort',
        question: 'In India, a minor (person under 18) can be sued for a tort:',
        options: ['Only if they have attained the age of 14', 'In the same manner and to the same extent as an adult', 'Only if they acted with malice', 'Never; parents are always liable'],
        correctAnswer: 1
      },
      {
        id: 516,
        topic: 'tort',
        question: 'What is the main difference between "Assault" and "Battery"?',
        options: ['Assault requires physical contact; Battery does not', 'Battery is an apprehension of force; Assault is the application of force', 'Assault is an apprehension of force; Battery is the actual application of force', 'There is no difference in the law of torts'],
        correctAnswer: 2
      },
      {
        id: 517,
        topic: 'tort',
        question: '"Mayhem" is an action maintainable when a bodily member is lost that:',
        options: ['Results in death', 'Deprives a person of a fighting limb', 'Only affects the person\'s appearance', 'Is caused by negligence only'],
        correctAnswer: 1
      },
      {
        id: 518,
        topic: 'tort',
        question: 'For "False Imprisonment" to occur, the restraint must be:',
        options: ['Partial', 'Total', 'For at least 24 hours', 'Conducted by a police officer'],
        correctAnswer: 1
      },
      {
        id: 519,
        topic: 'tort',
        question: 'Which form of defamation is addressed to the eye (permanent form)?',
        options: ['Slander', 'Libel', 'Innuendo', 'Malicious Falsehood'],
        correctAnswer: 1
      },
      {
        id: 520,
        topic: 'tort',
        question: 'A statement that is prima facie innocent but carries a secondary defamatory meaning is called:',
        options: ['Slander', 'Privilege', 'Innuendo', 'Deceit'],
        correctAnswer: 2
      },
      {
        id: 521,
        topic: 'tort',
        question: 'In the tort of "Deceit," the defendant must have made a false statement:',
        options: ['Unintentionally', 'Knowingly, with intent to induce the plaintiff to act', 'About a matter of opinion', 'Without causing any damage'],
        correctAnswer: 1
      },
      {
        id: 522,
        topic: 'tort',
        question: 'Which landmark case established the modern law of Negligence and the "Neighbor Principle"?',
        options: ['Rylands v. Fletcher', 'Donoghue v. Stevenson', 'Ashby v. White', 'Bourhill v. Young'],
        correctAnswer: 1
      },
      {
        id: 523,
        topic: 'tort',
        question: '"Res Ipsa Loquitur" is a rule of evidence meaning:',
        options: ['The plaintiff must prove every detail of negligence', 'The thing speaks for itself', 'No liability without fault', 'The burden of proof never shifts'],
        correctAnswer: 1
      },
      {
        id: 524,
        topic: 'tort',
        question: 'If a person\'s own negligence contributed to the damage they suffered, it is called:',
        options: ['Strict Liability', 'Vicarious Liability', 'Contributory Negligence', 'Composite Tort'],
        correctAnswer: 2
      },
      {
        id: 525,
        topic: 'tort',
        question: 'The rule in Rylands v. Fletcher (1868) deals with:',
        options: ['Absolute Liability', 'Strict Liability', 'Vicarious Liability', 'Negligence'],
        correctAnswer: 1
      },
      {
        id: 526,
        topic: 'tort',
        question: 'Which of the following is an essential for Strict Liability?',
        options: ['Natural use of land', 'Escape of a dangerous thing', 'Act of a third party', 'Plaintiff\'s consent'],
        correctAnswer: 1
      },
      {
        id: 527,
        topic: 'tort',
        question: 'The "Rule of Absolute Liability" was propounded by the Supreme Court of India in:',
        options: ['Rylands v. Fletcher', 'M.C. Mehta v. Union of India', 'Kasturilal v. State of U.P.', 'State of Rajasthan v. Vidhyavathi'],
        correctAnswer: 1
      },
      {
        id: 528,
        topic: 'tort',
        question: 'Animals dangerous by nature are classified as:',
        options: ['Animals mansuetae naturae', 'Animals ferae naturae', 'Domestic animals', 'Scienter animals'],
        correctAnswer: 1
      },
      {
        id: 529,
        topic: 'tort',
        question: 'The test used to determine if a defendant is liable for consequences following a wrongful act is:',
        options: ['Test of Directness', 'Test of Reasonable Foresight', 'Both A and B', 'Neither A nor B'],
        correctAnswer: 2
      },
      {
        id: 530,
        topic: 'tort',
        question: 'Which case established that "Directness" is no longer the sole test for remoteness, favoring "Reasonable Foresight"?',
        options: ['Re Polemis', 'The Wagon Mound Case', 'Scott v. Shepherd', 'Smith v. London and South Western Railway'],
        correctAnswer: 1
      },
      {
        id: 531,
        topic: 'tort',
        question: 'Nervous shock caused by seeing or hearing an event is actionable if:',
        options: ['It results in a "private frolic"', 'The injury was a reasonably foreseeable consequence', 'The plaintiff was a trespasser', 'No physical injury occurred'],
        correctAnswer: 1
      },
      {
        id: 532,
        topic: 'tort',
        question: '"Malicious Prosecution" requires the plaintiff to prove that the proceedings ended in:',
        options: ['A conviction', 'Favour of the plaintiff', 'A settlement', 'A mistrial'],
        correctAnswer: 1
      },
      {
        id: 533,
        topic: 'tort',
        question: 'An unlawful interference with a person’s use or enjoyment of land is called:',
        options: ['Trespass', 'Conversion', 'Nuisance', 'Detinue'],
        correctAnswer: 2
      },
      {
        id: 534,
        topic: 'tort',
        question: 'In "Trespass to Land," the entry must be:',
        options: ['Intentional and without justification', 'Only by a person, not an object', 'Proven to have caused actual damage', 'Authorized by the owner'],
        correctAnswer: 0
      },
      {
        id: 535,
        topic: 'tort',
        question: '"Trespass ab initio" occurs when a person enters land lawfully but subsequently:',
        options: ['Leaves immediately', 'Abuses the authority by committing a wrongful act', 'Pays the required fee', 'Corrects a mistake'],
        correctAnswer: 1
      },
      {
        id: 536,
        topic: 'tort',
        question: '"Distress Damage Feasant" allows an occupier of land to:',
        options: ['Sue for liquidated damages', 'Seize trespassing cattle until compensation is paid', 'Imprison a trespasser', 'Sell the trespassing goods immediately'],
        correctAnswer: 1
      },
      {
        id: 537,
        topic: 'tort',
        question: '"Conversion" (Trover) involves:',
        options: ['Direct physical interference with goods', 'Dealing with goods in a manner that deprives the owner of use/possession', 'Simply touching someone else\'s property', 'A breach of contract'],
        correctAnswer: 1
      },
      {
        id: 538,
        topic: 'tort',
        question: 'The maxim "Actio personalis moritur cum persona" means:',
        options: ['A personal right of action dies with the person', 'The law is not concerned with small things', 'One who acts through another acts himself', 'Actionable without proof of damage'],
        correctAnswer: 0
      },
      {
        id: 539,
        topic: 'tort',
        question: '"Passing Off" is a tort designed to protect:',
        options: ['Personal reputation', 'Commercial goodwill and business reputation', 'Private land from trespassers', 'Consumers from physical injury'],
        correctAnswer: 1
      },
      {
        id: 540,
        topic: 'tort',
        question: 'Which of the following is an "Extra-Judicial Remedy"?',
        options: ['Damages', 'Injunction', 'Re-entry on land', 'Specific restitution of property'],
        correctAnswer: 2
      },

      // Consumer Protection & Motor Vehicles Act
      {
        id: 541,
        topic: 'consumer_law',
        question: 'Under the Consumer Protection Act 1986, a "Consumer" does NOT include a person who:',
        options: ['Hires services for a consideration', 'Purchases goods for resale or commercial purposes', 'Uses goods with the approval of the buyer', 'Purchases goods on a deferred payment basis'],
        correctAnswer: 1
      },
      {
        id: 542,
        topic: 'consumer_law',
        question: 'The "District Forum" has jurisdiction to entertain complaints where the value of goods/services does not exceed:',
        options: ['Rupees five lakhs', 'Rupees ten lakhs', 'Rupees twenty lakhs', 'Rupees one crore'],
        correctAnswer: 2
      },
      {
        id: 543,
        topic: 'consumer_law',
        question: 'A "State Commission" can entertain complaints where the value exceeds 20 lakhs but does not exceed:',
        options: ['50 lakhs', '1 crore', '2 crores', '5 crores'],
        correctAnswer: 1
      },
      {
        id: 544,
        topic: 'consumer_law',
        question: 'What is the limitation period for filing a complaint in a Consumer Forum?',
        options: ['One year from the date of cause of action', 'Two years from the date of cause of action', 'Three years from the date of cause of action', 'Six months from the date of cause of action'],
        correctAnswer: 1
      },
      {
        id: 545,
        topic: 'consumer_law',
        question: 'Which of the following is a "Right of Consumers" under the Act?',
        options: ['Right to Safety', 'Right to be Heard', 'Right to Consumer Education', 'All of the above'],
        correctAnswer: 3
      },
      {
        id: 546,
        topic: 'consumer_law',
        question: 'Section 140 of the Motor Vehicles Act 1988 provides for liability on the principle of:',
        options: ['Fault liability', 'No-fault liability', 'Vicarious liability', 'Strict liability'],
        correctAnswer: 1
      },
      {
        id: 547,
        topic: 'consumer_law',
        question: 'Under Section 140, the fixed compensation for "death" in a motor accident is:',
        options: ['Rs. 25,000', 'Rs. 50,000', 'Rs. 1,00,000', 'Rs. 15,000'],
        correctAnswer: 1
      },
      {
        id: 548,
        topic: 'consumer_law',
        question: 'In which chapter of the Motor Vehicles Act 1988 is "compulsory insurance" against third-party risks mentioned?',
        options: ['Chapter X', 'Chapter XI', 'Chapter XII', 'Chapter XIII'],
        correctAnswer: 1
      },
      {
        id: 549,
        topic: 'consumer_law',
        question: 'An application for compensation in motor accidents is made to the:',
        options: ['District Court', 'MACT (Motor Accidents Claims Tribunal)', 'Consumer Forum', 'High Court'],
        correctAnswer: 1
      },
      {
        options: ['Rylands v. Fletcher', 'Donoghue v. Stevenson', 'Ashby v. White', 'Bourhill v. Young'],
        correctAnswer: 1
      },
      {
        id: 523,
        topic: 'tort',
        question: '"Res Ipsa Loquitur" is a rule of evidence meaning:',
        options: ['The plaintiff must prove every detail of negligence', 'The thing speaks for itself', 'No liability without fault', 'The burden of proof never shifts'],
        correctAnswer: 1
      },
      {
        id: 524,
        topic: 'tort',
        question: 'If a person\'s own negligence contributed to the damage they suffered, it is called:',
        options: ['Strict Liability', 'Vicarious Liability', 'Contributory Negligence', 'Composite Tort'],
        correctAnswer: 2
      },
      {
        id: 525,
        topic: 'tort',
        question: 'The rule in Rylands v. Fletcher (1868) deals with:',
        options: ['Absolute Liability', 'Strict Liability', 'Vicarious Liability', 'Negligence'],
        correctAnswer: 1
      },
      {
        id: 526,
        topic: 'tort',
        question: 'Which of the following is an essential for Strict Liability?',
        options: ['Natural use of land', 'Escape of a dangerous thing', 'Act of a third party', 'Plaintiff\'s consent'],
        correctAnswer: 1
      },
      {
        id: 527,
        topic: 'tort',
        question: 'The "Rule of Absolute Liability" was propounded by the Supreme Court of India in:',
        options: ['Rylands v. Fletcher', 'M.C. Mehta v. Union of India', 'Kasturilal v. State of U.P.', 'State of Rajasthan v. Vidhyavathi'],
        correctAnswer: 1
      },
      {
        id: 528,
        topic: 'tort',
        question: 'Animals dangerous by nature are classified as:',
        options: ['Animals mansuetae naturae', 'Animals ferae naturae', 'Domestic animals', 'Scienter animals'],
        correctAnswer: 1
      },
      {
        id: 529,
        topic: 'tort',
        question: 'The test used to determine if a defendant is liable for consequences following a wrongful act is:',
        options: ['Test of Directness', 'Test of Reasonable Foresight', 'Both A and B', 'Neither A nor B'],
        correctAnswer: 2
      },
      {
        id: 530,
        topic: 'tort',
        question: 'Which case established that "Directness" is no longer the sole test for remoteness, favoring "Reasonable Foresight"?',
        options: ['Re Polemis', 'The Wagon Mound Case', 'Scott v. Shepherd', 'Smith v. London and South Western Railway'],
        correctAnswer: 1
      },
      {
        id: 531,
        topic: 'tort',
        question: 'Nervous shock caused by seeing or hearing an event is actionable if:',
        options: ['It results in a "private frolic"', 'The injury was a reasonably foreseeable consequence', 'The plaintiff was a trespasser', 'No physical injury occurred'],
        correctAnswer: 1
      },
      {
        id: 532,
        topic: 'tort',
        question: '"Malicious Prosecution" requires the plaintiff to prove that the proceedings ended in:',
        options: ['A conviction', 'Favour of the plaintiff', 'A settlement', 'A mistrial'],
        correctAnswer: 1
      },
      {
        id: 533,
        topic: 'tort',
        question: 'An unlawful interference with a person’s use or enjoyment of land is called:',
        options: ['Trespass', 'Conversion', 'Nuisance', 'Detinue'],
        correctAnswer: 2
      },
      {
        id: 534,
        topic: 'tort',
        question: 'In "Trespass to Land," the entry must be:',
        options: ['Intentional and without justification', 'Only by a person, not an object', 'Proven to have caused actual damage', 'Authorized by the owner'],
        correctAnswer: 0
      },
      {
        id: 535,
        topic: 'tort',
        question: '"Trespass ab initio" occurs when a person enters land lawfully but subsequently:',
        options: ['Leaves immediately', 'Abuses the authority by committing a wrongful act', 'Pays the required fee', 'Corrects a mistake'],
        correctAnswer: 1
      },
      {
        id: 536,
        topic: 'tort',
        question: '"Distress Damage Feasant" allows an occupier of land to:',
        options: ['Sue for liquidated damages', 'Seize trespassing cattle until compensation is paid', 'Imprison a trespasser', 'Sell the trespassing goods immediately'],
        correctAnswer: 1
      },
      {
        id: 537,
        topic: 'tort',
        question: '"Conversion" (Trover) involves:',
        options: ['Direct physical interference with goods', 'Dealing with goods in a manner that deprives the owner of use/possession', 'Simply touching someone else\'s property', 'A breach of contract'],
        correctAnswer: 1
      },
      {
        id: 538,
        topic: 'tort',
        question: 'The maxim "Actio personalis moritur cum persona" means:',
        options: ['A personal right of action dies with the person', 'The law is not concerned with small things', 'One who acts through another acts himself', 'Actionable without proof of damage'],
        correctAnswer: 0
      },
      {
        id: 539,
        topic: 'tort',
        question: '"Passing Off" is a tort designed to protect:',
        options: ['Personal reputation', 'Commercial goodwill and business reputation', 'Private land from trespassers', 'Consumers from physical injury'],
        correctAnswer: 1
      },
      {
        id: 540,
        topic: 'tort',
        question: 'Which of the following is an "Extra-Judicial Remedy"?',
        options: ['Damages', 'Injunction', 'Re-entry on land', 'Specific restitution of property'],
        correctAnswer: 2
      },

      // Consumer Protection & Motor Vehicles Act
      {
        id: 541,
        topic: 'consumer_law',
        question: 'Under the Consumer Protection Act 1986, a "Consumer" does NOT include a person who:',
        options: ['Hires services for a consideration', 'Purchases goods for resale or commercial purposes', 'Uses goods with the approval of the buyer', 'Purchases goods on a deferred payment basis'],
        correctAnswer: 1
      },
      {
        id: 542,
        topic: 'consumer_law',
        question: 'The "District Forum" has jurisdiction to entertain complaints where the value of goods/services does not exceed:',
        options: ['Rupees five lakhs', 'Rupees ten lakhs', 'Rupees twenty lakhs', 'Rupees one crore'],
        correctAnswer: 2
      },
      {
        id: 543,
        topic: 'consumer_law',
        question: 'A "State Commission" can entertain complaints where the value exceeds 20 lakhs but does not exceed:',
        options: ['50 lakhs', '1 crore', '2 crores', '5 crores'],
        correctAnswer: 1
      },
      {
        id: 544,
        topic: 'consumer_law',
        question: 'What is the limitation period for filing a complaint in a Consumer Forum?',
        options: ['One year from the date of cause of action', 'Two years from the date of cause of action', 'Three years from the date of cause of action', 'Six months from the date of cause of action'],
        correctAnswer: 1
      },
      {
        id: 545,
        topic: 'consumer_law',
        question: 'Which of the following is a "Right of Consumers" under the Act?',
        options: ['Right to Safety', 'Right to be Heard', 'Right to Consumer Education', 'All of the above'],
        correctAnswer: 3
      },
      {
        id: 546,
        topic: 'consumer_law',
        question: 'Section 140 of the Motor Vehicles Act 1988 provides for liability on the principle of:',
        options: ['Fault liability', 'No-fault liability', 'Vicarious liability', 'Strict liability'],
        correctAnswer: 1
      },
      {
        id: 547,
        topic: 'consumer_law',
        question: 'Under Section 140, the fixed compensation for "death" in a motor accident is:',
        options: ['Rs. 25,000', 'Rs. 50,000', 'Rs. 1,00,000', 'Rs. 15,000'],
        correctAnswer: 1
      },
      {
        id: 548,
        topic: 'consumer_law',
        question: 'In which chapter of the Motor Vehicles Act 1988 is "compulsory insurance" against third-party risks mentioned?',
        options: ['Chapter X', 'Chapter XI', 'Chapter XII', 'Chapter XIII'],
        correctAnswer: 1
      },
      {
        id: 549,
        topic: 'consumer_law',
        question: 'An application for compensation in motor accidents is made to the:',
        options: ['District Court', 'MACT (Motor Accidents Claims Tribunal)', 'Consumer Forum', 'High Court'],
        correctAnswer: 1
      },
      {
        id: 550,
        topic: 'consumer_law',
        question: 'Claims under Section 163A of the Motor Vehicles Act are based on:',
        options: ['Proof of negligence of the driver', 'A structured formula basis', 'The absolute discretion of the Judge', 'The income of the driver'],
        correctAnswer: 1
      },
      {
        "id": 601,
        "topic": "constitutional",
        "question": "On which date did the Constitution of free India come into force?",
        "options": [
          "15th August 1947",
          "26th November 1949",
          "26th January 1950",
          "30th January 1948"
        ],
        "correctAnswer": 2
      },
      {
        "id": 602,
        "topic": "constitutional",
        "question": "Who was the President of the Constituent Assembly that signed the Indian Constitution?",
        "options": [
          "Dr B.R. Ambedkar",
          "Dr Rajendra Prasad",
          "Jawaharlal Nehru",
          "Sardar Vallabhbhai Patel"
        ],
        "correctAnswer": 1
      },
      {
        "id": 603,
        "topic": "constitutional",
        "question": "Originally, the Indian Constitution consisted of how many Articles and Schedules?",
        "options": [
          "395 Articles and 8 Schedules",
          "465 Articles and 12 Schedules",
          "448 Articles and 10 Schedules",
          "395 Articles and 12 Schedules"
        ],
        "correctAnswer": 0
      },
      {
        "id": 604,
        "topic": "constitutional",
        "question": "From which Constitution did the Indian framers adopt the idea of Directive Principles of State Policy?",
        "options": [
          "American Constitution",
          "Constitution of Ireland",
          "British Constitution",
          "German Reich Constitution"
        ],
        "correctAnswer": 1
      },
      {
        "id": 605,
        "topic": "constitutional",
        "question": "Which case established that the Preamble is a part of the Indian Constitution?",
        "options": [
          "Re Berubari case",
          "Kesavananda Bharati v. State of Kerala",
          "A.K. Gopalan v. State of Madras",
          "Excel Wear v. Union of India"
        ],
        "correctAnswer": 1
      },
      {
        "id": 606,
        "topic": "constitutional",
        "question": "The words \"Socialist\" and \"Secular\" were inserted into the Preamble by which Amendment?",
        "options": [
          "24th Amendment Act, 1971",
          "44th Amendment Act, 1978",
          "42nd Amendment Act, 1976",
          "86th Amendment Act, 2002"
        ],
        "correctAnswer": 2
      },
      {
        "id": 607,
        "topic": "constitutional",
        "question": "In a Republic, the head of the State is not a hereditary monarch but a person elected for a:",
        "options": [
          "Life term",
          "Fixed term",
          "Term of 10 years",
          "Period at the pleasure of the Parliament"
        ],
        "correctAnswer": 1
      },
      {
        "id": 608,
        "topic": "constitutional",
        "question": "Which part of the Constitution is regarded as its 'soul'?",
        "options": [
          "Fundamental Rights",
          "Directive Principles of State Policy",
          "The Preamble",
          "Fundamental Duties"
        ],
        "correctAnswer": 2
      },
      {
        "id": 609,
        "topic": "constitutional",
        "question": "Article 1 of the Constitution declares that India shall be a:",
        "options": [
          "Federation of States",
          "Union of States",
          "Association of States",
          "Confederation of States"
        ],
        "correctAnswer": 1
      },
      {
        "id": 610,
        "topic": "constitutional",
        "question": "Which Article empowers the Parliament to form new States and alter the boundaries of existing States?",
        "options": [
          "Article 1",
          "Article 2",
          "Article 3",
          "Article 4"
        ],
        "correctAnswer": 2
      },
      {
        "id": 611,
        "topic": "constitutional",
        "question": "Does the power of Parliament to diminish the area of a State under Article 3 include the power to cede Indian territory to a foreign state?",
        "options": [
          "Yes, by a simple majority",
          "No, it requires a Constitutional Amendment under Article 368",
          "Yes, with the consent of the affected State",
          "No, Indian territory can never be ceded"
        ],
        "correctAnswer": 1
      },
      {
        "id": 612,
        "topic": "constitutional",
        "question": "Which part of the Constitution deals with Citizenship?",
        "options": [
          "Part I",
          "Part II",
          "Part III",
          "Part IV"
        ],
        "correctAnswer": 1
      },
      {
        "id": 613,
        "topic": "constitutional",
        "question": "To acquire citizenship by domicile at the commencement of the Constitution, a person must have been an ordinary resident in India for not less than:",
        "options": [
          "Two years",
          "Five years",
          "Seven years",
          "Ten years"
        ],
        "correctAnswer": 1
      },
      {
        "id": 614,
        "topic": "constitutional",
        "question": "Under Article 9, a person ceases to be a citizen of India if they voluntarily acquire the citizenship of:",
        "options": [
          "A neighbouring country",
          "Any foreign state",
          "A commonwealth country",
          "A state within the Union"
        ],
        "correctAnswer": 1
      },
      {
        "id": 615,
        "topic": "constitutional",
        "question": "Which Act provides for the acquisition and termination of citizenship after the commencement of the Constitution?",
        "options": [
          "The Representation of the People Act, 1951",
          "The Citizenship Act, 1955",
          "The Foreigners Act, 1946",
          "The Passports Act, 1967"
        ],
        "correctAnswer": 1
      },
      {
        "id": 616,
        "topic": "constitutional",
        "question": "\"Termination\" of citizenship occurs when a citizen of India voluntarily acquires the citizenship of:",
        "options": [
          "Another country",
          "A United Nations territory",
          "A state within India",
          "An enemy country during war"
        ],
        "correctAnswer": 0
      },
      {
        "id": 617,
        "topic": "constitutional",
        "question": "Fundamental Rights are enshrined in which part of the Constitution?",
        "options": [
          "Part II",
          "Part III",
          "Part IV",
          "Part IVA"
        ],
        "correctAnswer": 1
      },
      {
        "id": 618,
        "topic": "constitutional",
        "question": "Which document from 1214 is the first written document relating to the fundamental rights of citizens?",
        "options": [
          "Bill of Rights",
          "Declaration of the Rights of Man",
          "Magna Carta",
          "American Constitution"
        ],
        "correctAnswer": 2
      },
      {
        "id": 619,
        "topic": "constitutional",
        "question": "Under Article 12, the term 'State' includes which of the following?",
        "options": [
          "The Central Government and Parliament",
          "The State Governments and Legislatures",
          "All local or other authorities",
          "All of the above"
        ],
        "correctAnswer": 3
      },
      {
        "id": 620,
        "topic": "constitutional",
        "question": "Which case established that the International Airports Authority is 'State' within the meaning of Article 12?",
        "options": [
          "Ajay Hasia v. Khalid Mujib",
          "R.D. Shetty v. International Airports Authority of India",
          "Som Prakash v. Union of India",
          "Sukhdev Singh v. Bhagatram"
        ],
        "correctAnswer": 1
      },
      {
        "id": 621,
        "topic": "constitutional",
        "question": "Laws inconsistent with Fundamental Rights are declared void under which Article?",
        "options": [
          "Article 12",
          "Article 13",
          "Article 14",
          "Article 32"
        ],
        "correctAnswer": 1
      },
      {
        "id": 622,
        "topic": "constitutional",
        "question": "The \"Doctrine of Eclipse\" applies to which type of laws?",
        "options": [
          "Post-constitutional laws only",
          "Pre-constitutional laws only",
          "Both Pre and Post-constitutional laws",
          "Laws made by foreign states"
        ],
        "correctAnswer": 1
      },
      {
        "id": 623,
        "topic": "constitutional",
        "question": "Article 14 guarantees which two concepts of equality?",
        "options": [
          "Equality of status and opportunity",
          "Equality before the law and Equal protection of the laws",
          "Social and economic equality",
          "Political and legal equality"
        ],
        "correctAnswer": 1
      },
      {
        "id": 624,
        "topic": "constitutional",
        "question": "The concept of \"Equality before law\" is a corollary of Dicey’s concept of:",
        "options": [
          "Separation of Powers",
          "Rule of Law",
          "Parliamentary Sovereignty",
          "Natural Justice"
        ],
        "correctAnswer": 1
      },
      {
        "id": 625,
        "topic": "constitutional",
        "question": "Reasonable classification under Article 14 must be founded on an:",
        "options": [
          "Absolute distinction",
          "Intelligible differentia",
          "Arbitrary selection",
          "Individual's status"
        ],
        "correctAnswer": 1
      },
      {
        "id": 626,
        "topic": "constitutional",
        "question": "Article 15 prohibits discrimination by the State against citizens on grounds ONLY of:",
        "options": [
          "Religion, race, caste, sex, place of birth or any of them",
          "Language and culture",
          "Residence and domicile",
          "Wealth and education"
        ],
        "correctAnswer": 0
      },
      {
        "id": 627,
        "topic": "constitutional",
        "question": "Which Article empowers the State to make special provisions for women and children?",
        "options": [
          "Article 14",
          "Article 15(3)",
          "Article 16(2)",
          "Article 17"
        ],
        "correctAnswer": 1
      },
      {
        "id": 628,
        "topic": "constitutional",
        "question": "Article 16 guarantees equality of opportunity in matters of:",
        "options": [
          "Social status",
          "Religious practice",
          "Public employment",
          "Private contracts"
        ],
        "correctAnswer": 2
      },
      {
        "id": 629,
        "topic": "constitutional",
        "question": "In the \"Mandal Commission Case\" (Indra Sawhney v. Union of India), the Supreme Court held that the maximum limit of reservation cannot exceed:",
        "options": [
          "27%",
          "33%",
          "50%",
          "69%"
        ],
        "correctAnswer": 2
      },
      {
        "id": 630,
        "topic": "constitutional",
        "question": "Which Article abolishes \"Untouchability\" and forbids its practice in any form?",
        "options": [
          "Article 16",
          "Article 17",
          "Article 18",
          "Article 19"
        ],
        "correctAnswer": 1
      },
      {
        "id": 631,
        "topic": "constitutional",
        "question": "Under Article 18, the State is prohibited from conferring any titles EXCEPT:",
        "options": [
          "Political titles",
          "Religious titles",
          "Military and Academic distinctions",
          "Noble titles"
        ],
        "correctAnswer": 2
      },
      {
        "id": 632,
        "topic": "constitutional",
        "question": "How many freedoms are currently guaranteed to citizens under Article 19(1)?",
        "options": [
          "Five",
          "Six",
          "Seven",
          "Eight"
        ],
        "correctAnswer": 1
      },
      {
        "id": 633,
        "topic": "constitutional",
        "question": "Which freedom was omitted by the 44th Amendment Act, 1978?",
        "options": [
          "Freedom of assembly",
          "Freedom of movement",
          "Right to acquire, hold and dispose of property",
          "Freedom of profession"
        ],
        "correctAnswer": 2
      },
      {
        "id": 634,
        "topic": "constitutional",
        "question": "Freedom of speech and expression includes the \"freedom of press\" as per which case?",
        "options": [
          "Romesh Thapper v. State of Madras",
          "Brij Bhushan v. State of Delhi",
          "Express Newspaper v. Union of India",
          "All of the above"
        ],
        "correctAnswer": 3
      },
      {
        "id": 635,
        "topic": "constitutional",
        "question": "The \"National Anthem Case\" (Bijoe Emmanuel v. State of Kerala) involved the right to:",
        "options": [
          "Freedom of Press",
          "Freedom of Silence",
          "Freedom of Association",
          "Freedom of Movement"
        ],
        "correctAnswer": 1
      },
      {
        "id": 636,
        "topic": "constitutional",
        "question": "Reasonable restrictions on the freedom of speech and expression can be imposed in the interest of:",
        "options": [
          "Sovereignty and integrity of India",
          "Security of the State",
          "Public order, decency or morality",
          "All of the above"
        ],
        "correctAnswer": 3
      },
      {
        "id": 637,
        "topic": "constitutional",
        "question": "Article 20(2) embodies the common law rule of \"nemo debet vis vexari,\" which protects against:",
        "options": [
          "Ex post facto law",
          "Double Jeopardy",
          "Self-incrimination",
          "Arbitrary arrest"
        ],
        "correctAnswer": 1
      },
      {
        "id": 638,
        "topic": "constitutional",
        "question": "Protection against self-incrimination (Article 20(3)) means an accused cannot be compelled to:",
        "options": [
          "Give their name",
          "Be a witness against themselves",
          "Sign a bail bond",
          "Undergo a physical medical exam"
        ],
        "correctAnswer": 1
      },
      {
        "id": 639,
        "topic": "constitutional",
        "question": "Article 21 guarantees that no person shall be deprived of his life or personal liberty except according to:",
        "options": [
          "Due process of law",
          "Procedure established by law",
          "Executive discretion",
          "International treaties"
        ],
        "correctAnswer": 1
      },
      {
        "id": 640,
        "topic": "constitutional",
        "question": "In which landmark case did the Supreme Court hold that the procedure under Article 21 must be \"just, fair and reasonable\"?",
        "options": [
          "A.K. Gopalan case",
          "Maneka Gandhi v. Union of India",
          "Kharak Singh v. State of UP",
          "Satwant Singh case"
        ],
        "correctAnswer": 1
      },
      {
        "id": 641,
        "topic": "constitutional",
        "question": "Every person who is arrested and detained in custody must be produced before the nearest Magistrate within a period of:",
        "options": [
          "12 hours",
          "24 hours",
          "48 hours",
          "72 hours"
        ],
        "correctAnswer": 1
      },
      {
        "id": 642,
        "topic": "constitutional",
        "question": "Article 23 prohibits which of the following practices?",
        "options": [
          "Untouchability",
          "Traffic in human beings and 'begar' (forced labour)",
          "Child labour in factories",
          "Titles of nobility"
        ],
        "correctAnswer": 1
      },
      {
        "id": 643,
        "topic": "constitutional",
        "question": "Article 24 prohibits the employment of children below the age of 14 years in:",
        "options": [
          "Schools",
          "Innocent or harmless jobs",
          "Factories and hazardous employment",
          "Agriculture"
        ],
        "correctAnswer": 2
      },
      {
        "id": 644,
        "topic": "constitutional",
        "question": "Which Article grants the right to manage religious affairs to every religious denomination?",
        "options": [
          "Article 25",
          "Article 26",
          "Article 27",
          "Article 28"
        ],
        "correctAnswer": 1
      },
      {
        "id": 645,
        "topic": "constitutional",
        "question": "Article 32 allows a person to move the Supreme Court for the enforcement of Fundamental Rights through which mechanism?",
        "options": [
          "Appeals",
          "Review petitions",
          "Writs",
          "Public meetings"
        ],
        "correctAnswer": 2
      },
      {
        "id": 646,
        "topic": "constitutional",
        "question": "The writ of \"Quo Warranto\" is issued to:",
        "options": [
          "Command a public duty",
          "Release a person from illegal detention",
          "Challenge the legality of a person holding a public office",
          "Quash the order of an inferior court"
        ],
        "correctAnswer": 2
      },
      {
        "id": 647,
        "topic": "constitutional",
        "question": "Directive Principles of State Policy are contained in which part of the Constitution?",
        "options": [
          "Part III",
          "Part IV",
          "Part IVA",
          "Part V"
        ],
        "correctAnswer": 1
      },
      {
        "id": 648,
        "topic": "constitutional",
        "question": "How many Fundamental Duties are currently listed for citizens under Article 51A?",
        "options": [
          "Ten",
          "Eleven",
          "Twelve",
          "Nine"
        ],
        "correctAnswer": 1
      }
    ,
  {
    "id": 701,
    "topic": "criminal",
    "question": "Who defined a crime as an act committed or omitted in violation of a public law forbidding or commanding it?",
    "options": [
      "Sir William Blackstone",
      "Kenny",
      "Professor Goodhart",
      "Sir James Fitz James Stephen"
    ],
    "correctAnswer": 0
  },
  {
    "id": 702,
    "topic": "criminal",
    "question": "When was the First Law Commission appointed in India?",
    "options": [
      "1860",
      "1835",
      "1933",
      "1833"
    ],
    "correctAnswer": 1
  },
  {
    "id": 703,
    "topic": "criminal",
    "question": "Who was the Chairman of the First Law Commission of India?",
    "options": [
      "Lord Cornwallis",
      "Sir James Stephen",
      "Lord T.B. Macaulay",
      "Sir William Blackstone"
    ],
    "correctAnswer": 2
  },
  {
    "id": 704,
    "topic": "criminal",
    "question": "The Bharatiya Nyaya Sanhita (BNS) consists of how many sections?",
    "options": [
      "395",
      "465",
      "358",
      "511"
    ],
    "correctAnswer": 2
  },
  {
    "id": 705,
    "topic": "criminal",
    "question": "Which maxim expresses the fundamental principle that an act does not make a person guilty unless their mind is also guilty?",
    "options": [
      "De minimis non curat lex",
      "Ignorantia facti excusat",
      "Actus non facit reum nisi mens sit rea",
      "Respondeat superior"
    ],
    "correctAnswer": 2
  },
  {
    "id": 706,
    "topic": "criminal",
    "question": "Actus reus refers to which essential element of a crime?",
    "options": [
      "Guilty mind",
      "The physical result of human conduct prohibited by law",
      "A moral wrong",
      "An involuntary movement"
    ],
    "correctAnswer": 1
  },
  {
    "id": 707,
    "topic": "criminal",
    "question": "If a somnambulist (sleepwalker) sets fire to a house, they are not liable because the act was:",
    "options": [
      "Done in good faith",
      "Involuntary",
      "A mistake of fact",
      "A private frolic"
    ],
    "correctAnswer": 1
  },
  {
    "id": 708,
    "topic": "criminal",
    "question": "Which term is defined as \"want of care\" where a person fails to act as a prudent man?",
    "options": [
      "Recklessness",
      "Negligence",
      "Intention",
      "Knowledge"
    ],
    "correctAnswer": 1
  },
  {
    "id": 709,
    "topic": "criminal",
    "question": "Section 2(7) of the BNS defines which term related to causing wrongful gain or loss?",
    "options": [
      "Fraudulently",
      "Voluntarily",
      "Dishonestly",
      "Negligently"
    ],
    "correctAnswer": 2
  },
  {
    "id": 710,
    "topic": "criminal",
    "question": "What is \"wrongful gain\" as defined by Section 2(36) of the BNS?",
    "options": [
      "Gain by lawful means of property to which one is entitled",
      "Gain by unlawful means of property to which the person gaining is not legally entitled",
      "Any increase in personal wealth",
      "Retention of property with the owner's consent"
    ],
    "correctAnswer": 1
  },
  {
    "id": 711,
    "topic": "criminal",
    "question": "Which term is used when a person does a thing with the intent to defraud but not otherwise?",
    "options": [
      "Dishonestly",
      "Voluntarily",
      "Fraudulently",
      "Maliciously"
    ],
    "correctAnswer": 2
  },
  {
    "id": 712,
    "topic": "criminal",
    "question": "In the case of State of Maharashtra v. M.H. George, the Supreme Court restorative a conviction for bringing gold into India based on:",
    "options": [
      "The doctrine of necessity",
      "Lack of mens rea being irrelevant for a statutory prohibition",
      "Private defence",
      "Mistake of law being a valid excuse"
    ],
    "correctAnswer": 1
  },
  {
    "id": 713,
    "topic": "criminal",
    "question": "The Territorial Waters of India extend to how many nautical miles from the base line?",
    "options": [
      "10",
      "12",
      "24",
      "200"
    ],
    "correctAnswer": 1
  },
  {
    "id": 714,
    "topic": "criminal",
    "question": "Section 3(5) of the BNS deals with liability based on:",
    "options": [
      "Private defence",
      "Common intention",
      "Negligence",
      "Mistake of fact"
    ],
    "correctAnswer": 1
  },
  {
    "id": 715,
    "topic": "criminal",
    "question": "Which of the following is NOT a form of punishment under Section 4 of the BNS?",
    "options": [
      "Forfeiture of property",
      "Community Service",
      "Solitary confinement as a primary punishment",
      "Imprisonment for life"
    ],
    "correctAnswer": 2
  },
  {
    "id": 716,
    "topic": "criminal",
    "question": "In which landmark case did the Supreme Court hold that the death sentence should be given only in the \"rarest of rare cases\"?",
    "options": [
      "Mithu v. State of Punjab",
      "Bachan Singh v. State of Punjab",
      "R. v. Govinda",
      "M.C. Mehta v. Union of India"
    ],
    "correctAnswer": 1
  },
  {
    "id": 717,
    "topic": "criminal",
    "question": "According to Section 71 of the BNS, \"imprisonment for life\" means:",
    "options": [
      "Imprisonment for 14 years",
      "Imprisonment for 20 years",
      "Imprisonment for the remainder of that person’s natural life",
      "Imprisonment until the Governor commutes the sentence"
    ],
    "correctAnswer": 2
  },
  {
    "id": 718,
    "topic": "criminal",
    "question": "Solitary confinement must not exceed how many months in total for a single sentence?",
    "options": [
      "One month",
      "Three months",
      "Six months",
      "Twelve months"
    ],
    "correctAnswer": 1
  },
  {
    "id": 719,
    "topic": "criminal",
    "question": "Which theory of punishment aims to \"gratify the desire for vengeance\" in the victim?",
    "options": [
      "Preventive Theory",
      "Deterrent Theory",
      "Retributive Theory",
      "Reformative Theory"
    ],
    "correctAnswer": 2
  },
  {
    "id": 720,
    "topic": "criminal",
    "question": "The maxim \"Ignorantia facti excusat\" means:",
    "options": [
      "Ignorance of law is an excuse",
      "Ignorance of fact is an excuse",
      "Ignorance of law is not an excuse",
      "Ignorance of fact is not an excuse"
    ],
    "correctAnswer": 1
  },
  {
    "id": 721,
    "topic": "criminal",
    "question": "Under the BNS, nothing is an offence which is done by a child under what age?",
    "options": [
      "Seven years",
      "Twelve years",
      "Eighteen years",
      "Ten years"
    ],
    "correctAnswer": 0
  },
  {
    "id": 722,
    "topic": "criminal",
    "question": "A child between the ages of 7 and 12 is not liable for an offence if they:",
    "options": [
      "Acted under a mistake of fact",
      "Have not attained sufficient mental maturity to judge the nature of their conduct",
      "Acted in self-defence",
      "Acted with the consent of a guardian"
    ],
    "correctAnswer": 1
  },
  {
    "id": 723,
    "topic": "criminal",
    "question": "Which legal test is used as the foundation for the law of insanity in India?",
    "options": [
      "The Neighbor Principle",
      "The M’Naghten Rules",
      "The Pigeon-hole Theory",
      "The Rule of Strict Liability"
    ],
    "correctAnswer": 1
  },
  {
    "id": 724,
    "topic": "criminal",
    "question": "Involuntary drunkenness is a defence only if the intoxicating substance was administered:",
    "options": [
      "By a doctor",
      "Without the person's knowledge or against their will",
      "For a religious ritual",
      "During a wedding party"
    ],
    "correctAnswer": 1
  },
  {
    "id": 725,
    "topic": "criminal",
    "question": "To consent to take the risk of harm under Section 25 of the BNS, a person must be above:",
    "options": [
      "12 years of age",
      "16 years of age",
      "18 years of age",
      "21 years of age"
    ],
    "correctAnswer": 2
  },
  {
    "id": 726,
    "topic": "criminal",
    "question": "In R. v. Dudley and Stephens, the court rejected which defence regarding the killing of a boy for food?",
    "options": [
      "Insanity",
      "Accident",
      "Necessity",
      "Private Defence"
    ],
    "correctAnswer": 2
  },
  {
    "id": 727,
    "topic": "criminal",
    "question": "The right of private defence is primarily:",
    "options": [
      "A punitive right",
      "A retributive right",
      "A defensive right",
      "A right to revenge"
    ],
    "correctAnswer": 2
  },
  {
    "id": 728,
    "topic": "criminal",
    "question": "Private defence is NOT available against a public servant acting in good faith unless there is apprehension of:",
    "options": [
      "Simple hurt",
      "Theft",
      "Death or grievous hurt",
      "Damage to property"
    ],
    "correctAnswer": 2
  },
  {
    "id": 729,
    "topic": "criminal",
    "question": "The right of private defence of the body extends to causing death if there is a reasonable apprehension of:",
    "options": [
      "Simple assault",
      "Theft of a cycle",
      "Kidnapping or abduction",
      "Verbal abuse"
    ],
    "correctAnswer": 2
  },
  {
    "id": 730,
    "topic": "criminal",
    "question": "Which section provides the right to cause death in private defence against an acid attack?",
    "options": [
      "Section 100",
      "Section 38(g)",
      "Section 147",
      "Section 124"
    ],
    "correctAnswer": 1
  },
  {
    "id": 731,
    "topic": "criminal",
    "question": "A person is an \"abettor\" if they instigate, engage in a conspiracy, or:",
    "options": [
      "Report the crime to police",
      "Intentionally aid the commission of an offence",
      "Watch the crime happen",
      "Are present at the scene by accident"
    ],
    "correctAnswer": 1
  },
  {
    "id": 732,
    "topic": "criminal",
    "question": "The minimum number of persons required to constitute a criminal conspiracy is:",
    "options": [
      "One",
      "Two",
      "Five",
      "Ten"
    ],
    "correctAnswer": 1
  },
  {
    "id": 733,
    "topic": "criminal",
    "question": "Which section of the BNS defines the offence of rape?",
    "options": [
      "Section 375",
      "Section 63",
      "Section 101",
      "Section 80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 734,
    "topic": "criminal",
    "question": "Sexual intercourse by a man with his own wife is NOT rape if the wife is not under:",
    "options": [
      "12 years of age",
      "15 years of age",
      "18 years of age",
      "21 years of age"
    ],
    "correctAnswer": 2
  },
  {
    "id": 735,
    "topic": "criminal",
    "question": "For a death to be classified as \"dowry death,\" it must occur within how many years of marriage?",
    "options": [
      "Five years",
      "Seven years",
      "Ten years",
      "Three years"
    ],
    "correctAnswer": 1
  },
  {
    "id": 736,
    "topic": "criminal",
    "question": "A second marriage during the lifetime of a spouse is bigamy and punishable with imprisonment for:",
    "options": [
      "3 years",
      "7 years",
      "10 years",
      "Life"
    ],
    "correctAnswer": 1
  },
  {
    "id": 737,
    "topic": "criminal",
    "question": "\"Culpable homicide\" is defined in which section of the BNS?",
    "options": [
      "Section 101",
      "Section 100",
      "Section 302",
      "Section 299"
    ],
    "correctAnswer": 1
  },
  {
    "id": 738,
    "topic": "criminal",
    "question": "The \"Doctrine of Transfer of Malice\" is embodied in which section?",
    "options": [
      "Section 34",
      "Section 100",
      "Section 102",
      "Section 149"
    ],
    "correctAnswer": 2
  },
  {
    "id": 739,
    "topic": "criminal",
    "question": "Under the BNS, \"hit and run\" cases where the driver fails to report the incident to police or a Magistrate can be punished with imprisonment up to:",
    "options": [
      "2 years",
      "5 years",
      "7 years",
      "10 years"
    ],
    "correctAnswer": 3
  },
  {
    "id": 740,
    "topic": "criminal",
    "question": "To constitute an \"Organised Crime Syndicate,\" a group must consist of how many persons?",
    "options": [
      "Five or more",
      "Two or more",
      "Ten or more",
      "Three or more"
    ],
    "correctAnswer": 1
  },
  {
    "id": 741,
    "topic": "criminal",
    "question": "An act is considered \"Grievous Hurt\" if it causes the sufferer to be in severe bodily pain or unable to follow ordinary pursuits for:",
    "options": [
      "7 days",
      "15 days",
      "20 days",
      "30 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 742,
    "topic": "criminal",
    "question": "What is the main difference between wrongful restraint and wrongful confinement?",
    "options": [
      "Restraint is total; Confinement is partial",
      "Restraint is partial; Confinement is total",
      "Restraint applies only to property",
      "Confinement applies only to children"
    ],
    "correctAnswer": 1
  },
  {
    "id": 743,
    "topic": "criminal",
    "question": "Which offence involves making a gesture or preparation that causes another to apprehend the use of criminal force?",
    "options": [
      "Battery",
      "Assault",
      "Affray",
      "Rioting"
    ],
    "correctAnswer": 1
  },
  {
    "id": 744,
    "topic": "criminal",
    "question": "\"Kidnapping from India\" involves conveying a person beyond the limits of India without the consent of:",
    "options": [
      "The person or their legal authorized representative",
      "The Central Government",
      "The Police",
      "The local Magistrate"
    ],
    "correctAnswer": 0
  },
  {
    "id": 745,
    "topic": "criminal",
    "question": "Waging war against the Government of India (Treason) is punishable under:",
    "options": [
      "Section 121",
      "Section 147",
      "Section 152",
      "Section 189"
    ],
    "correctAnswer": 1
  },
  {
    "id": 746,
    "topic": "criminal",
    "question": "How many persons are required to constitute an \"Unlawful Assembly\"?",
    "options": [
      "Two",
      "Three",
      "Five",
      "Seven"
    ],
    "correctAnswer": 2
  },
  {
    "id": 747,
    "topic": "criminal",
    "question": "When force or violence is used by an unlawful assembly in prosecution of a common object, it is called:",
    "options": [
      "Affray",
      "Assault",
      "Rioting",
      "Criminal Trespass"
    ],
    "correctAnswer": 2
  },
  {
    "id": 748,
    "topic": "criminal",
    "question": "An \"Affray\" must occur in which type of location?",
    "options": [
      "Private house",
      "Police station",
      "Public place",
      "High court"
    ],
    "correctAnswer": 2
  },
  {
    "id": 749,
    "topic": "criminal",
    "question": "The offence of theft is complete as soon as the property is:",
    "options": [
      "Sold to a third party",
      "Taken out of the city",
      "Moved in order to facilitate the taking",
      "Hidden in the owner's house"
    ],
    "correctAnswer": 2
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
              { title: 'Syllabus', url: `${req.protocol}://${req.get('host')}/public/notes/Syllabus_Contracts.html` },
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
            notes: [
              { title: 'Syllabus', url: `${req.protocol}://${req.get('host')}/public/notes/Syllabus_Torts.html` },{ title: 'Law of Torts - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Law of Torts -Anil K Nair.pdf` }],
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
            notes: [
              { title: 'Syllabus', url: `${req.protocol}://${req.get('host')}/public/notes/Syllabus_Constitutional_Law_1.html` },{ title: 'Constitutional_Law_1.pdf', url: `${req.protocol}://${req.get('host')}/public/notes/Constitutional_Law_1.pdf` }],
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
            notes: [
              { title: 'Syllabus', url: `${req.protocol}://${req.get('host')}/public/notes/Syllabus_Family_Law_1.html` },{ title: 'Family Law 1 - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Family Law 1 -Anil K Nair.pdf` }],
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
            notes: [
              { title: 'Syllabus', url: `${req.protocol}://${req.get('host')}/public/notes/Syllabus_Law_of_Crimes_1.html` },{ title: 'BNS - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/BNS ANIL K NAIR.pdf` }],
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
            notes: [
              { title: 'Syllabus', url: `${req.protocol}://${req.get('host')}/public/notes/Syllabus_Legal_Language.html` },{ title: 'Legal Language & Legal Writing - Anil K Nair', url: `${req.protocol}://${req.get('host')}/public/notes/Legal Language & Legal Writing-Anil K Nair.pdf` }],
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
