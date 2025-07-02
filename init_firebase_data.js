// Firebase Configuration (use your actual config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVZE3KqET6EFRdCHCGkwak8ALjYii-B0Y",
    authDomain: "sinupa-fdsm2025.firebaseapp.com",
    projectId: "sinupa-fdsm2025",
    storageBucket: "sinupa-fdsm2025.firebasestorage.app",
    messagingSenderId: "1045085663493",
    appId: "1:1045085663493:web:50cc5807662539a253476c",
    measurementId: "G-J8RYFDWSF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

async function initGroups() {
    const groupsData = [
        { id: "1", name: "Grupo 1", password: "cop2025_g1", leaderName: "Líder do Grupo 1" },
        { id: "2", name: "Grupo 2", password: "cop2025_g2", leaderName: "Líder do Grupo 2" },
        { id: "3", name: "Grupo 3", password: "cop2025_g3", leaderName: "Líder do Grupo 3" },
        { id: "4", name: "Grupo 4", password: "cop2025_g4", leaderName: "Líder do Grupo 4" },
        { id: "5", name: "Grupo 5", password: "cop2025_g5", leaderName: "Líder do Grupo 5" }
    ];

    for (const group of groupsData) {
        const hashedPassword = hashPassword(group.password);
        await setDoc(doc(db, "groups", group.id), {
            name: group.name,
            password: hashedPassword,
            leaderName: group.leaderName,
            totalScore: 0,
            challengesCompleted: 0,
            createdAt: new Date()
        });
        console.log(`Grupo ${group.name} criado.`);
    }
}

async function initAdmins() {
    const adminData = {
        username: "admin",
        password: "admin123"
    };
    const hashedPassword = hashPassword(adminData.password);
    await setDoc(doc(db, "admins", adminData.username), {
        password: hashedPassword,
        createdAt: new Date(),
        lastLogin: null
    });
    console.log(`Administrador ${adminData.username} criado.`);
}

async function initChallenges() {
    const challengesData = [
        {
            day: 1,
            title: "O Dilema da Mineração e o Desenvolvimento Econômico",
            description: "Análise do equilíbrio entre exploração mineral e proteção ambiental, considerando impactos sociais e econômicos.",
            questions: [
                { id: 1, question: "Como o Brasil pode equilibrar a necessidade de exploração mineral para o desenvolvimento econômico com a proteção ambiental?", type: "essay" },
                { id: 2, question: "Quais são os principais impactos sociais da mineração em comunidades locais e como podem ser mitigados?", type: "essay" },
                { id: 3, question: "Analise o papel da tecnologia na redução dos impactos ambientais da mineração.", type: "essay" },
                { id: 4, question: "Proponha um modelo de governança para a atividade minerária que considere sustentabilidade e desenvolvimento.", type: "essay" }
            ],
            maxScore: 100,
            isActive: true,
            createdAt: new Date()
        },
        {
            day: 2,
            title: "A Crise das Queimadas e a Soberania Nacional",
            description: "Discussão sobre cooperação internacional no combate às queimadas respeitando a soberania nacional.",
            questions: [
                { id: 1, question: "Como o Brasil pode aceitar cooperação internacional para combater queimadas sem comprometer sua soberania?", type: "essay" },
                { id: 2, question: "Quais são os principais desafios diplomáticos relacionados às queimadas na Amazônia?", type: "essay" },
                { id: 3, question: "Analise o impacto das queimadas nas relações comerciais internacionais do Brasil.", type: "essay" },
                { id: 4, question: "Proponha estratégias de comunicação internacional para melhorar a imagem do Brasil na questão ambiental.", type: "essay" }
            ],
            maxScore: 100,
            isActive: true,
            createdAt: new Date()
        },
        {
            day: 3,
            title: "Resíduos da Mineração e Recuperação de Áreas Degradadas",
            description: "Estudo de casos como Mariana e Brumadinho, propondo modelos de governança e recuperação ambiental.",
            questions: [
                { id: 1, question: "Quais lições podem ser aprendidas dos desastres de Mariana e Brumadinho para prevenir futuros acidentes?", type: "essay" },
                { id: 2, question: "Como melhorar os sistemas de monitoramento e fiscalização da atividade minerária?", type: "essay" },
                { id: 3, question: "Analise os processos de reparação e compensação às comunidades afetadas.", type: "essay" },
                { id: 4, question: "Proponha um modelo de governança corporativa para empresas mineradoras que priorize a segurança.", type: "essay" }
            ],
            maxScore: 100,
            isActive: true,
            createdAt: new Date()
        },
        {
            day: 4,
            title: "Cadeia de Suprimentos e Consumo Consciente",
            description: "Análise da cadeia de suprimentos da mineração e desenvolvimento de critérios para minerais éticos.",
            questions: [
                { id: 1, question: "Como desenvolver critérios internacionais para certificação de minerais éticos?", type: "essay" },
                { id: 2, question: "Qual o papel dos consumidores finais na promoção de práticas minerárias sustentáveis?", type: "essay" },
                { id: 3, question: "Analise os desafios de rastreabilidade na cadeia de suprimentos de minerais.", type: "essay" },
                { id: 4, question: "Proponha mecanismos de incentivo para empresas adotarem práticas de mineração ética.", type: "essay" }
            ],
            maxScore: 100,
            isActive: true,
            createdAt: new Date()
        },
        {
            day: 5,
            title: "Soluções Inovadoras e o Futuro da Sustentabilidade",
            description: "Apresentação de tecnologias inovadoras e políticas públicas para um futuro sustentável no Brasil.",
            questions: [
                { id: 1, question: "Quais tecnologias emergentes podem revolucionar a mineração sustentável no Brasil?", type: "essay" },
                { id: 2, question: "Como as políticas públicas podem incentivar a transição para uma economia mais sustentável?", type: "essay" },
                { id: 3, question: "Analise o potencial do Brasil como líder global em mineração sustentável.", type: "essay" },
                { id: 4, question: "Proponha um plano de ação para os próximos 10 anos visando a sustentabilidade do setor mineral brasileiro.", type: "essay" }
            ],
            maxScore: 100,
            isActive: true,
            createdAt: new Date()
        }
    ];

    for (const challenge of challengesData) {
        await setDoc(doc(db, "challenges", `day_${challenge.day}`), challenge);
        console.log(`Desafio do Dia ${challenge.day} criado.`);
    }
}

async function main() {
    console.log("Iniciando inicialização de dados no Firebase...");
    await initGroups();
    await initAdmins();
    await initChallenges();
    console.log("Inicialização de dados concluída!");
}

main().catch(console.error);

