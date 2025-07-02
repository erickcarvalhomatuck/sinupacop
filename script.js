// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

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
const analytics = getAnalytics(app);

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const accessPlatformBtn = document.getElementById('accessPlatformBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const groupTab = document.getElementById('groupTab');
const adminTab = document.getElementById('adminTab');
const groupForm = document.getElementById('groupForm');
const adminForm = document.getElementById('adminForm');
const groupLoginBtn = document.getElementById('groupLoginBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const challengesGrid = document.getElementById('challengesGrid');
const rankingContainer = document.getElementById('rankingContainer');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');
const notificationContainer = document.getElementById('notificationContainer');

// Current user state
let currentUser = null;
let userType = null; // 'group' or 'admin'

// Utility Functions
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Modal Functions
function openModal() {
    loginModal.style.display = 'flex';
}

function closeModalFunc() {
    loginModal.style.display = 'none';
}

function switchTab(tab) {
    if (tab === 'group') {
        groupTab.classList.add('active');
        adminTab.classList.remove('active');
        groupForm.classList.remove('hidden');
        adminForm.classList.add('hidden');
    } else {
        adminTab.classList.add('active');
        groupTab.classList.remove('active');
        adminForm.classList.remove('hidden');
        groupForm.classList.add('hidden');
    }
}

// Authentication Functions
async function loginGroup() {
    const groupId = document.getElementById('groupSelect').value;
    const password = document.getElementById('groupPassword').value;
    
    if (!groupId || !password) {
        showNotification('Por favor, selecione um grupo e digite a senha', 'error');
        return;
    }
    
    try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        
        if (!groupDoc.exists()) {
            showNotification('Grupo não encontrado', 'error');
            return;
        }
        
        const groupData = groupDoc.data();
        const hashedPassword = hashPassword(password);
        
        if (groupData.password === hashedPassword) {
            currentUser = { id: groupId, ...groupData };
            userType = 'group';
            closeModalFunc();
            showDashboard();
            showNotification(`Bem-vindo, ${groupData.name}!`, 'success');
        } else {
            showNotification('Senha incorreta', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro ao fazer login', 'error');
    }
}

async function loginAdmin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        showNotification('Por favor, digite usuário e senha', 'error');
        return;
    }
    
    try {
        const adminDoc = await getDoc(doc(db, 'admins', username));
        
        if (!adminDoc.exists()) {
            showNotification('Usuário não encontrado', 'error');
            return;
        }
        
        const adminData = adminDoc.data();
        const hashedPassword = hashPassword(password);
        
        if (adminData.password === hashedPassword) {
            currentUser = { id: username, ...adminData };
            userType = 'admin';
            closeModalFunc();
            showDashboard();
            showNotification(`Bem-vindo, Administrador!`, 'success');
        } else {
            showNotification('Senha incorreta', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro ao fazer login', 'error');
    }
}

function logout() {
    currentUser = null;
    userType = null;
    hideDashboard();
    showNotification('Logout realizado com sucesso', 'success');
}

// Dashboard Functions
function showDashboard() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.about').style.display = 'none';
    document.querySelector('.challenges').style.display = 'none';
    document.querySelector('.ranking').style.display = 'none';
    dashboard.classList.remove('hidden');
    
    if (userType === 'group') {
        loadGroupDashboard();
    } else if (userType === 'admin') {
        loadAdminDashboard();
    }
}

function hideDashboard() {
    dashboard.classList.add('hidden');
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.about').style.display = 'block';
    document.querySelector('.challenges').style.display = 'block';
    document.querySelector('.ranking').style.display = 'block';
}

async function loadGroupDashboard() {
    const dashboardTitle = document.getElementById('dashboardTitle');
    const dashboardContent = document.getElementById('dashboardContent');
    
    dashboardTitle.textContent = `Dashboard - ${currentUser.name}`;
    
    try {
        // Load challenges
        const challengesSnapshot = await getDocs(collection(db, 'challenges'));
        const challenges = [];
        
        challengesSnapshot.forEach(doc => {
            challenges.push({ id: doc.id, ...doc.data() });
        });
        
        challenges.sort((a, b) => a.day - b.day);
        
        dashboardContent.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3><i class="fas fa-chart-line"></i> Estatísticas do Grupo</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${currentUser.totalScore || 0}</div>
                            <div class="stat-label">Pontos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${currentUser.challengesCompleted || 0}</div>
                            <div class="stat-label">Desafios</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${currentUser.leaderName || 'N/A'}</div>
                            <div class="stat-label">Líder</div>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <h3><i class="fas fa-tasks"></i> Desafios Disponíveis</h3>
                    <div class="challenge-list">
                        ${challenges.map(challenge => `
                            <div class="challenge-item">
                                <strong>Dia ${challenge.day}: ${challenge.title}</strong>
                                <p>${challenge.description}</p>
                                <div class="challenge-actions">
                                    <span class="challenge-status status-available">Disponível</span>
                                    <button class="btn-small btn-outline" onclick="viewChallengeDetails(${challenge.day})">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dashboard', 'error');
    }
}

async function loadAdminDashboard() {
    const dashboardTitle = document.getElementById('dashboardTitle');
    const dashboardContent = document.getElementById('dashboardContent');
    
    dashboardTitle.textContent = 'Painel Administrativo';
    
    try {
        // Load groups and challenges data
        const groupsSnapshot = await getDocs(collection(db, 'groups'));
        const challengesSnapshot = await getDocs(collection(db, 'challenges'));
        
        const groups = [];
        const challenges = [];
        
        groupsSnapshot.forEach(doc => {
            groups.push({ id: doc.id, ...doc.data() });
        });
        
        challengesSnapshot.forEach(doc => {
            challenges.push({ id: doc.id, ...doc.data() });
        });
        
        dashboardContent.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3><i class="fas fa-chart-bar"></i> Estatísticas Gerais</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${groups.length}</div>
                            <div class="stat-label">Grupos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${challenges.length}</div>
                            <div class="stat-label">Desafios</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${groups.length * 25}</div>
                            <div class="stat-label">Delegados</div>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <h3><i class="fas fa-users"></i> Grupos Participantes</h3>
                    <div class="challenge-list">
                        ${groups.map(group => `
                            <div class="challenge-item">
                                <strong>${group.name}</strong>
                                <p>Líder: ${group.leaderName || 'N/A'} | Pontos: ${group.totalScore || 0}</p>
                                <div class="challenge-actions">
                                    <span class="challenge-status status-available">Ativo</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dashboard', 'error');
    }
}

// Load challenges
async function loadChallenges() {
    try {
        const challengesSnapshot = await getDocs(collection(db, 'challenges'));
        const challenges = [];
        
        challengesSnapshot.forEach(doc => {
            challenges.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by day
        challenges.sort((a, b) => a.day - b.day);
        
        challengesGrid.innerHTML = challenges.map(challenge => `
            <div class="challenge-item">
                <div class="challenge-number">${challenge.day}</div>
                <div class="challenge-content">
                    <h3>${challenge.title}</h3>
                    <p>${challenge.description}</p>
                    <div class="challenge-tags">
                        ${challenge.questions && challenge.questions.length > 0 ? 
                            challenge.questions.slice(0, 3).map((_, index) => {
                                const tags = [
                                    ['Economia', 'Meio Ambiente', 'Comunidades'],
                                    ['Queimadas', 'Soberania', 'Cooperação'],
                                    ['Resíduos', 'Recuperação', 'Governança'],
                                    ['Suprimentos', 'Ética', 'Consumo'],
                                    ['Inovação', 'Tecnologia', 'Futuro']
                                ];
                                return tags[challenge.day - 1] ? tags[challenge.day - 1].map(tag => 
                                    `<span class="challenge-tag">${tag}</span>`
                                ).join('') : '';
                            }).join('') : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar desafios:', error);
        showNotification('Erro ao carregar desafios', 'error');
    }
}

async function loadRanking() {
    try {
        const groupsSnapshot = await getDocs(query(collection(db, 'groups'), orderBy('totalScore', 'desc')));
        const groups = [];
        
        groupsSnapshot.forEach(doc => {
            groups.push({ id: doc.id, ...doc.data() });
        });
        
        rankingContainer.innerHTML = groups.map((group, index) => {
            const position = index + 1;
            let positionClass = '';
            
            if (position === 1) positionClass = 'gold';
            else if (position === 2) positionClass = 'silver';
            else if (position === 3) positionClass = 'bronze';
            
            return `
                <div class="ranking-row">
                    <div class="ranking-position ${positionClass}">${position}</div>
                    <div class="ranking-group">${group.name}</div>
                    <div class="ranking-leader">${group.leaderName || 'Líder do ' + group.name}</div>
                    <div class="ranking-score">${group.totalScore || 0}</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        showNotification('Erro ao carregar ranking', 'error');
    }
}

// Challenge Details Function
function viewChallengeDetails(day) {
    showNotification(`Visualizando detalhes do Dia ${day}`, 'info');
    // Here you could open a modal with detailed challenge information
}

// Event Listeners
loginBtn.addEventListener('click', openModal);
accessPlatformBtn.addEventListener('click', openModal);
learnMoreBtn.addEventListener('click', () => {
    document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
});
closeModal.addEventListener('click', closeModalFunc);
groupTab.addEventListener('click', () => switchTab('group'));
adminTab.addEventListener('click', () => switchTab('admin'));
groupLoginBtn.addEventListener('click', loginGroup);
adminLoginBtn.addEventListener('click', loginAdmin);
logoutBtn.addEventListener('click', logout);

// Close modal when clicking outside
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModalFunc();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadChallenges();
    loadRanking();
});

// Make functions globally available
window.viewChallengeDetails = viewChallengeDetails;

