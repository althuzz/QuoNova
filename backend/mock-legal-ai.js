// Mock Legal AI Service - Works without external API
// Contains pre-loaded Indian legal knowledge

const legalKnowledge = {
    // Constitutional Law
    'article 21': {
        topic: 'Article 21 - Right to Life and Personal Liberty',
        summary: 'Article 21 of the Indian Constitution is one of the most important fundamental rights. It states: "No person shall be deprived of his life or personal liberty except according to procedure established by law."',
        cases: [
            {
                name: 'Maneka Gandhi v. Union of India (1978)',
                year: 1978,
                summary: 'Expanded the scope of Article 21. Held that "procedure established by law" must be just, fair, and reasonable.',
                significance: 'Landmark case that broadened the interpretation of personal liberty'
            },
            {
                name: 'Kharak Singh v. State of UP (1963)',
                year: 1963,
                summary: 'Discussed the right to privacy under Article 21.',
                significance: 'Early case on privacy rights'
            }
        ]
    },
    'fundamental rights': {
        topic: 'Fundamental Rights',
        summary: 'Fundamental Rights are enshrined in Part III of the Indian Constitution (Articles 12-35). They include Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.',
        cases: [
            {
                name: 'Kesavananda Bharati v. State of Kerala (1973)',
                year: 1973,
                summary: 'Established the Basic Structure Doctrine. Parliament cannot amend the Constitution to destroy its basic structure.',
                significance: 'Most important constitutional case in Indian history'
            },
            {
                name: 'Minerva Mills v. Union of India (1980)',
                year: 1980,
                summary: 'Reaffirmed the Basic Structure Doctrine and limited Parliament\'s amending power.',
                significance: 'Strengthened constitutional supremacy'
            }
        ]
    },
    'kesavananda bharati': {
        topic: 'Kesavananda Bharati v. State of Kerala (1973)',
        summary: 'The most landmark case in Indian constitutional history. A 13-judge bench delivered this historic judgment.',
        details: {
            year: 1973,
            judges: '13-judge bench (largest ever)',
            chiefJustice: 'Justice S.M. Sikri',
            keyPoints: [
                'Established the Basic Structure Doctrine',
                'Parliament cannot amend the Constitution to destroy its basic structure',
                'Fundamental Rights are part of the basic structure',
                'Judicial review is part of the basic structure'
            ],
            significance: 'Protected the Constitution from unlimited amendments by Parliament. Ensured checks and balances in democracy.',
            verdict: '7-6 majority upheld the Basic Structure Doctrine'
        }
    },
    'ipc': {
        topic: 'Indian Penal Code (IPC)',
        summary: 'The Indian Penal Code, 1860 is the main criminal code of India. It was drafted by Lord Macaulay and came into force in 1860. It covers all substantive aspects of criminal law.',
        cases: [
            {
                name: 'State of Maharashtra v. Mayer Hans George (1965)',
                year: 1965,
                summary: 'Defined "mens rea" (guilty mind) in Indian criminal law.',
                significance: 'Important for understanding criminal intent'
            }
        ]
    },
    'bns': {
        topic: 'Bharatiya Nyaya Sanhita (BNS) 2023',
        summary: 'The Bharatiya Nyaya Sanhita, 2023 replaced the Indian Penal Code. It came into effect on July 1, 2024. It modernizes criminal law with Indian terminology and removes colonial-era provisions.',
        keyChanges: [
            'Replaced IPC sections with BNS sections',
            'Introduced community service as punishment',
            'Enhanced penalties for crimes against women and children',
            'Removed sedition, added provisions for acts endangering sovereignty'
        ]
    },
    'section 302': {
        topic: 'Section 302 IPC - Murder',
        summary: 'Section 302 IPC deals with punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
        cases: [
            {
                name: 'Machhi Singh v. State of Punjab (1983)',
                year: 1983,
                summary: 'Established the "rarest of rare" doctrine for death penalty.',
                significance: 'Guidelines for awarding death penalty'
            }
        ]
    },
    'right to privacy': {
        topic: 'Right to Privacy',
        summary: 'The Right to Privacy is a fundamental right under Article 21 of the Indian Constitution, as declared by the Supreme Court.',
        cases: [
            {
                name: 'Justice K.S. Puttaswamy v. Union of India (2017)',
                year: 2017,
                summary: '9-judge bench unanimously held that Right to Privacy is a fundamental right under Article 21.',
                significance: 'Landmark judgment recognizing privacy as a fundamental right'
            }
        ]
    }
};

function findRelevantKnowledge(query) {
    const lowerQuery = query.toLowerCase();

    // Direct match
    for (const [key, value] of Object.entries(legalKnowledge)) {
        if (lowerQuery.includes(key)) {
            return value;
        }
    }

    // Keyword matching
    if (lowerQuery.includes('murder') || lowerQuery.includes('302')) {
        return legalKnowledge['section 302'];
    }
    if (lowerQuery.includes('privacy')) {
        return legalKnowledge['right to privacy'];
    }
    if (lowerQuery.includes('constitution') || lowerQuery.includes('amendment')) {
        return legalKnowledge['fundamental rights'];
    }

    return null;
}

function formatResponse(knowledge) {
    if (!knowledge) {
        return "I apologize, but I don't have specific information about that topic in my current knowledge base. I specialize in:\n\n• Constitutional Law (Articles, Fundamental Rights)\n• IPC and BNS provisions\n• Landmark Supreme Court cases\n• Criminal and Civil law concepts\n\nTry asking about:\n- Article 21\n- Fundamental Rights\n- Kesavananda Bharati case\n- IPC/BNS sections\n- Right to Privacy";
    }

    let response = `📚 **${knowledge.topic}**\n\n`;

    if (knowledge.summary) {
        response += `${knowledge.summary}\n\n`;
    }

    if (knowledge.details) {
        response += `**Case Details:**\n`;
        response += `• Year: ${knowledge.details.year}\n`;
        response += `• Bench: ${knowledge.details.judges}\n`;
        if (knowledge.details.chiefJustice) {
            response += `• Chief Justice: ${knowledge.details.chiefJustice}\n`;
        }
        response += `\n**Key Points:**\n`;
        knowledge.details.keyPoints.forEach(point => {
            response += `• ${point}\n`;
        });
        response += `\n**Significance:** ${knowledge.details.significance}\n`;
        if (knowledge.details.verdict) {
            response += `\n**Verdict:** ${knowledge.details.verdict}`;
        }
    }

    if (knowledge.keyChanges) {
        response += `**Key Changes:**\n`;
        knowledge.keyChanges.forEach(change => {
            response += `• ${change}\n`;
        });
    }

    if (knowledge.cases && knowledge.cases.length > 0) {
        response += `\n**Related Landmark Cases:**\n\n`;
        knowledge.cases.forEach((c, index) => {
            response += `${index + 1}. **${c.name}**\n`;
            response += `   📅 Year: ${c.year}\n`;
            response += `   📖 ${c.summary}\n`;
            response += `   ⚖️ Significance: ${c.significance}\n\n`;
        });
    }

    return response;
}

async function sendMessage(message) {
    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const knowledge = findRelevantKnowledge(message);
    return formatResponse(knowledge);
}

module.exports = {
    sendMessage
};
