// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
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
const analytics = getAnalytics(app);

// DOM Elements
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');
const loginModal = document.querySelector('.login-modal');
const loginBtn = document.querySelector('.login-btn');
const closeModal = document.querySelector('.close-modal');
const groupTab = document.querySelector('.group-tab');
const adminTab = document.querySelector('.admin-tab');
const groupForm = document.querySelector('.group-form');
const adminForm = document.querySelector('.admin-form');
const groupLoginBtn = document.querySelector('.group-login-btn');
const adminLoginBtn = document.querySelector('.admin-login-btn');
const rankingContainer = document.querySelector('.ranking-container');

// API Base URL
const API_BASE = window.location.origin + '/api';

// Token management
let authToken = localStorage.getItem('authToken');
let userType = localStorage.getItem('userType');

// Mobile menu toggle
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Modal controls
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
}

// Tab switching
if (groupTab) {
    groupTab.addEventListener('click', () => {
        groupTab.classList.add('active');
        adminTab.classList.remove('active');
        groupForm.style.display = 'block';
        adminForm.style.display = 'none';
    });
}

if (adminTab) {
    adminTab.addEventListener('click', () => {
        adminTab.classList.add('active');
        groupTab.classList.remove('active');
        adminForm.style.display = 'block';
        groupForm.style.display = 'none';
    });
}

// Group login
if (groupLoginBtn) {
    groupLoginBtn.addEventListener('click', async () => {
        const groupSelect = document.querySelector('#groupSelect');
        const groupPassword = document.querySelector('#groupPassword');
        
        const groupId = groupSelect.value;
        const password = groupPassword.value;
        
        if (!groupId || !password) {
            showNotification('Por favor, selecione um grupo e digite a senha', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/auth/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    group_id: parseInt(groupId),
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userType', 'group');
                localStorage.setItem('groupData', JSON.stringify(data.group));
                
                showNotification('Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = '/static/dashboard.html';
                }, 1500);
            } else {
                showNotification(data.error || 'Erro no login', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showNotification('Erro de conexão', 'error');
        }
    });
}

// Admin login
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', async () => {
        const adminUsername = document.querySelector('#adminUsername');
        const adminPassword = document.querySelector('#adminPassword');
        
        const username = adminUsername.value;
        const password = adminPassword.value;
        
        if (!username || !password) {
            showNotification('Por favor, digite usuário e senha', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/auth/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userType', 'admin');
                localStorage.setItem('adminData', JSON.stringify(data.admin));
                
                showNotification('Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = '/static/admin.html';
                }, 1500);
            } else {
                showNotification(data.error || 'Erro no login', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showNotification('Erro de conexão', 'error');
        }
    });
}

// Load ranking
async function loadRanking() {
    if (!rankingContainer) return;
    
    try {
        const response = await fetch(`${API_BASE}/ranking`);
        const data = await response.json();
        
        if (data.success) {
            displayRanking(data.ranking);
        } else {
            console.error('Erro ao carregar ranking:', data.error);
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
    }
}

// Display ranking
function displayRanking(ranking) {
    if (!rankingContainer) return;
    
    rankingContainer.innerHTML = '';
    
    ranking.forEach((group, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        let medalClass = '';
        if (index === 0) medalClass = 'gold';
        else if (index === 1) medalClass = 'silver';
        else if (index === 2) medalClass = 'bronze';
        
        rankingItem.innerHTML = `
            <div class="ranking-position ${medalClass}">
                ${group.position}º
            </div>
            <div class="ranking-info">
                <h3>${group.group_name}</h3>
                <p>Pontuação: ${group.total_score} pontos</p>
                <p>Desafios: ${group.challenges_completed}/5</p>
            </div>
        `;
        
        rankingContainer.appendChild(rankingItem);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Manual close
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadRanking();
    
    // Auto-refresh ranking every 30 seconds
    setInterval(loadRanking, 30000);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

