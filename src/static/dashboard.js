// Dashboard JavaScript
let currentUser = null;
let challenges = [];
let submissions = [];
let currentChallenge = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboard();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (!token || userType !== 'group' || !userData) {
        window.location.href = '/';
        return;
    }
    
    currentUser = JSON.parse(userData);
    updateUserInfo();
}

// Update user info in header
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('group-name').textContent = currentUser.name;
        document.getElementById('group-leader').textContent = `Líder: ${currentUser.leader_name}`;
    }
}

// Load dashboard data
async function loadDashboard() {
    try {
        await Promise.all([
            loadChallenges(),
            loadSubmissions(),
            loadGroupStats()
        ]);
        
        renderChallenges();
        updateStats();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showAlert('Erro ao carregar dados do dashboard', 'error');
    }
}

// Load challenges
async function loadChallenges() {
    try {
        const response = await fetch('/api/challenges', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            challenges = data.challenges;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar desafios:', error);
        throw error;
    }
}

// Load submissions
async function loadSubmissions() {
    try {
        const response = await fetch('/api/my-submissions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            submissions = data.submissions;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar submissões:', error);
        throw error;
    }
}

// Load group stats
async function loadGroupStats() {
    try {
        const response = await fetch(`/api/ranking/group/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser.position = data.position;
            currentUser.total_score = data.group.total_score;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Render challenges
function renderChallenges() {
    const challengesList = document.getElementById('challenges-list');
    
    if (!challenges || challenges.length === 0) {
        challengesList.innerHTML = '<p>Nenhum desafio disponível no momento.</p>';
        return;
    }
    
    challengesList.innerHTML = challenges.map(challenge => {
        const submission = submissions.find(s => s.challenge_id === challenge.id);
        let status = 'available';
        let statusText = 'Disponível';
        let statusClass = 'status-available';
        
        if (submission) {
            if (submission.score !== null) {
                status = 'evaluated';
                statusText = `Avaliado (${submission.score}/${challenge.max_score})`;
                statusClass = 'status-evaluated';
            } else {
                status = 'submitted';
                statusText = 'Submetido';
                statusClass = 'status-submitted';
            }
        }
        
        return `
            <div class="challenge-card ${status === 'evaluated' ? 'completed' : status === 'submitted' ? 'submitted' : ''}">
                <div class="challenge-header">
                    <div class="day-badge">Dia ${challenge.day}</div>
                    <div class="status-badge ${statusClass}">${statusText}</div>
                </div>
                <h3>${challenge.title}</h3>
                <p>${challenge.description}</p>
                <div class="challenge-actions">
                    <button class="btn-challenge btn-view" onclick="viewChallenge(${challenge.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                    ${status === 'available' ? `
                        <button class="btn-challenge btn-submit" onclick="openSubmitModal(${challenge.id})">
                            <i class="fas fa-paper-plane"></i>
                            Submeter Resposta
                        </button>
                    ` : status === 'submitted' ? `
                        <button class="btn-challenge btn-disabled" disabled>
                            <i class="fas fa-clock"></i>
                            Aguardando Avaliação
                        </button>
                    ` : `
                        <button class="btn-challenge btn-view" onclick="viewSubmission(${submission.id})">
                            <i class="fas fa-check-circle"></i>
                            Ver Resultado
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Update stats
function updateStats() {
    const totalScore = currentUser.total_score || 0;
    const completedChallenges = submissions.filter(s => s.score !== null).length;
    const pendingChallenges = challenges.length - submissions.length;
    const position = currentUser.position || '-';
    
    document.getElementById('total-score').textContent = totalScore;
    document.getElementById('completed-challenges').textContent = completedChallenges;
    document.getElementById('pending-challenges').textContent = pendingChallenges;
    document.getElementById('group-position').textContent = position;
}

// View challenge details
function viewChallenge(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    currentChallenge = challenge;
    
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `Dia ${challenge.day}: ${challenge.title}`;
    
    modalBody.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h4>Descrição</h4>
            <p>${challenge.description}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4>Cenário</h4>
            <p style="line-height: 1.6; text-align: justify;">${challenge.scenario}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4>Questões para Análise</h4>
            <ol style="padding-left: 1.5rem;">
                ${challenge.questions.map(q => `<li style="margin-bottom: 0.5rem;">${q}</li>`).join('')}
            </ol>
        </div>
        
        <div style="background: var(--background-light); padding: 1rem; border-radius: 8px;">
            <strong>Pontuação Máxima:</strong> ${challenge.max_score} pontos
        </div>
    `;
    
    document.getElementById('challenge-modal').style.display = 'block';
}

// Open submit modal
function openSubmitModal(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    currentChallenge = challenge;
    
    const submitQuestions = document.getElementById('submit-questions');
    
    submitQuestions.innerHTML = `
        <div style="margin-bottom: 2rem; padding: 1rem; background: var(--background-light); border-radius: 8px;">
            <h4>Dia ${challenge.day}: ${challenge.title}</h4>
            <p>${challenge.description}</p>
        </div>
        
        ${challenge.questions.map((question, index) => `
            <div class="form-group">
                <label for="answer-${index}">
                    <strong>Questão ${index + 1}:</strong> ${question}
                </label>
                <textarea 
                    id="answer-${index}" 
                    name="answer-${index}" 
                    placeholder="Digite sua resposta aqui... (máximo 500 palavras)"
                    maxlength="3000"
                    required
                ></textarea>
            </div>
        `).join('')}
        
        <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <p><strong>Instruções:</strong></p>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                <li>Responda todas as questões de forma clara e objetiva</li>
                <li>Máximo de 500 palavras por resposta</li>
                <li>Trabalhe em equipe com seu grupo</li>
                <li>Após submeter, não será possível editar as respostas</li>
            </ul>
        </div>
    `;
    
    document.getElementById('submit-modal').style.display = 'block';
}

// Submit challenge response
document.getElementById('submit-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentChallenge) return;
    
    try {
        const formData = new FormData(e.target);
        const answers = {};
        
        currentChallenge.questions.forEach((question, index) => {
            const answer = formData.get(`answer-${index}`);
            if (answer && answer.trim()) {
                answers[`question_${index + 1}`] = answer.trim();
            }
        });
        
        if (Object.keys(answers).length !== currentChallenge.questions.length) {
            showAlert('Por favor, responda todas as questões.', 'error');
            return;
        }
        
        showLoading(e.target);
        
        const response = await fetch(`/api/challenges/${currentChallenge.id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ answers })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Resposta submetida com sucesso!', 'success');
            closeSubmitModal();
            loadDashboard(); // Reload dashboard
        } else {
            showAlert(data.message || 'Erro ao submeter resposta', 'error');
        }
    } catch (error) {
        console.error('Erro ao submeter:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    } finally {
        hideLoading(e.target);
    }
});

// View submission result
function viewSubmission(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const challenge = challenges.find(c => c.id === submission.challenge_id);
    if (!challenge) return;
    
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `Resultado - Dia ${challenge.day}`;
    
    modalBody.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h4>${challenge.title}</h4>
            <p>${challenge.description}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--success-color);">${submission.score}</div>
                <div style="color: var(--text-secondary);">Pontuação Obtida</div>
            </div>
            <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${challenge.max_score}</div>
                <div style="color: var(--text-secondary);">Pontuação Máxima</div>
            </div>
            <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">${Math.round((submission.score / challenge.max_score) * 100)}%</div>
                <div style="color: var(--text-secondary);">Aproveitamento</div>
            </div>
        </div>
        
        ${submission.feedback ? `
            <div style="margin-bottom: 2rem;">
                <h4>Feedback do Avaliador</h4>
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                    ${submission.feedback}
                </div>
            </div>
        ` : ''}
        
        <div style="margin-bottom: 2rem;">
            <h4>Suas Respostas</h4>
            ${Object.entries(submission.answers).map(([key, answer], index) => `
                <div style="margin-bottom: 1rem;">
                    <strong>Questão ${index + 1}:</strong> ${challenge.questions[index]}
                    <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                        ${answer}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="background: var(--background-light); padding: 1rem; border-radius: 8px;">
            <strong>Submetido em:</strong> ${formatDate(submission.submitted_at)}<br>
            ${submission.evaluated_at ? `<strong>Avaliado em:</strong> ${formatDate(submission.evaluated_at)}` : ''}
        </div>
    `;
    
    document.getElementById('challenge-modal').style.display = 'block';
}

// Close modals
function closeModal() {
    document.getElementById('challenge-modal').style.display = 'none';
    currentChallenge = null;
}

function closeSubmitModal() {
    document.getElementById('submit-modal').style.display = 'none';
    document.getElementById('submit-form').reset();
    currentChallenge = null;
}

// Quick actions
function viewRanking() {
    window.open('/#ranking', '_blank');
}

function viewSubmissions() {
    // Could open a detailed submissions view
    showAlert('Funcionalidade em desenvolvimento', 'info');
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        window.location.href = '/';
    }
}

// Utility functions
function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
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
    
    document.body.appendChild(alert);
    
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
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submetendo...';
    }
}

function hideLoading(element) {
    element.classList.remove('loading');
    const submitBtn = element.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submeter Resposta';
    }
}

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

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const challengeModal = document.getElementById('challenge-modal');
    const submitModal = document.getElementById('submit-modal');
    
    if (e.target === challengeModal) {
        closeModal();
    }
    
    if (e.target === submitModal) {
        closeSubmitModal();
    }
});

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
    loadGroupStats();
}, 30000);

