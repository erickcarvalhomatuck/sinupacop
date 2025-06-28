// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const tabBtns = document.querySelectorAll('.tab-btn');
const loginForms = document.querySelectorAll('.login-form');
const groupLoginForm = document.getElementById('group-login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const rankingList = document.getElementById('ranking-list');

// State
let currentUser = null;
let currentUserType = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadRanking();
    checkAuthStatus();
});

// Initialize App
function initializeApp() {
    setupEventListeners();
    setupSmoothScrolling();
    setupNavbarScroll();
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Login tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Login forms
    if (groupLoginForm) {
        groupLoginForm.addEventListener('submit', handleGroupLogin);
    }
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Tab Switching
function switchTab(tabName) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update forms
    loginForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === `${tabName}-login-form`) {
            form.classList.add('active');
        }
    });
}

// Navigation Click Handler
function handleNavClick(e) {
    const href = e.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // Close mobile menu if open
    if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
}

// Smooth Scrolling Setup
function setupSmoothScrolling() {
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
}

// Navbar Scroll Effect
function setupNavbarScroll() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Group Login Handler
async function handleGroupLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const groupName = formData.get('group-name');
    const password = formData.get('group-password');
    
    if (!groupName || !password) {
        showAlert('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    try {
        showLoading(e.target);
        
        const response = await fetch('/api/auth/group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.group;
            currentUserType = 'group';
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userType', 'group');
            localStorage.setItem('userData', JSON.stringify(data.group));
            
            showAlert('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showAlert(data.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    } finally {
        hideLoading(e.target);
    }
}

// Admin Login Handler
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('admin-username');
    const password = formData.get('admin-password');
    
    if (!username || !password) {
        showAlert('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    try {
        showLoading(e.target);
        
        const response = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.admin;
            currentUserType = 'admin';
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userType', 'admin');
            localStorage.setItem('userData', JSON.stringify(data.admin));
            
            showAlert('Login de administrador realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1500);
        } else {
            showAlert(data.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    } finally {
        hideLoading(e.target);
    }
}

// Load Ranking
async function loadRanking() {
    try {
        const response = await fetch('/api/ranking');
        const data = await response.json();
        
        if (response.ok) {
            displayRanking(data.ranking);
        } else {
            console.error('Erro ao carregar ranking:', data.message);
            displayEmptyRanking();
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        displayEmptyRanking();
    }
}

// Display Ranking
function displayRanking(ranking) {
    if (!rankingList) return;
    
    if (!ranking || ranking.length === 0) {
        displayEmptyRanking();
        return;
    }
    
    rankingList.innerHTML = ranking.map((group, index) => {
        const position = index + 1;
        const positionClass = position <= 3 ? `position-${position}` : 'position-default';
        
        return `
            <div class="ranking-row">
                <div class="ranking-cell position">
                    <div class="position-badge ${positionClass}">
                        ${position}
                    </div>
                </div>
                <div class="ranking-cell group">
                    <span class="group-name">${group.name}</span>
                </div>
                <div class="ranking-cell leader">
                    ${group.leader_name}
                </div>
                <div class="ranking-cell score">
                    <span class="score">${group.total_score}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Display Empty Ranking
function displayEmptyRanking() {
    if (!rankingList) return;
    
    const emptyGroups = [
        { name: 'Grupo 1', leader_name: 'Líder 1', total_score: 0 },
        { name: 'Grupo 2', leader_name: 'Líder 2', total_score: 0 },
        { name: 'Grupo 3', leader_name: 'Líder 3', total_score: 0 },
        { name: 'Grupo 4', leader_name: 'Líder 4', total_score: 0 },
        { name: 'Grupo 5', leader_name: 'Líder 5', total_score: 0 }
    ];
    
    displayRanking(emptyGroups);
}

// Check Authentication Status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (token && userType && userData) {
        currentUser = JSON.parse(userData);
        currentUserType = userType;
        
        // Update UI to show logged in state
        updateNavForLoggedInUser();
    }
}

// Update Navigation for Logged In User
function updateNavForLoggedInUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && currentUser) {
        if (currentUserType === 'group') {
            loginBtn.textContent = `${currentUser.name}`;
            loginBtn.href = '/dashboard';
        } else if (currentUserType === 'admin') {
            loginBtn.textContent = `Admin: ${currentUser.name}`;
            loginBtn.href = '/admin';
        }
    }
}

// Utility Functions
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add alert styles
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
    `;
    
    // Add to document
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function showLoading(element) {
    element.classList.add('loading');
    const submitBtn = element.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    }
}

function hideLoading(element) {
    element.classList.remove('loading');
    const submitBtn = element.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        const isGroupForm = element.id === 'group-login-form';
        submitBtn.innerHTML = isGroupForm 
            ? '<i class="fas fa-sign-in-alt"></i> Entrar como Grupo'
            : '<i class="fas fa-user-shield"></i> Entrar como Administrador';
    }
}

// Format date
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Format score
function formatScore(score) {
    return score.toString().padStart(3, '0');
}

// Refresh ranking periodically
setInterval(loadRanking, 30000); // Refresh every 30 seconds

// Add CSS for alerts
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .alert-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .alert-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .alert-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(alertStyles);

