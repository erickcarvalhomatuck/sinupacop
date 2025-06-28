// Admin Panel JavaScript
let currentAdmin = null;
let currentSubmission = null;
let allData = {
    groups: [],
    submissions: [],
    challenges: [],
    stats: {}
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadAdminData();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (!token || userType !== 'admin' || !userData) {
        window.location.href = '/';
        return;
    }
    
    currentAdmin = JSON.parse(userData);
    updateAdminInfo();
}

// Update admin info
function updateAdminInfo() {
    if (currentAdmin) {
        document.getElementById('admin-name').textContent = `Bem-vindo, ${currentAdmin.name}`;
    }
}

// Load all admin data
async function loadAdminData() {
    try {
        await Promise.all([
            loadStats(),
            loadRanking(),
            loadSubmissions(),
            loadChallenges()
        ]);
        
        renderCurrentTab();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('Erro ao carregar dados do painel', 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/ranking/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            allData.stats = data;
            updateStatsDisplay();
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Load ranking
async function loadRanking() {
    try {
        const response = await fetch('/api/ranking/detailed', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            allData.groups = data.detailed_ranking;
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
    }
}

// Load submissions
async function loadSubmissions() {
    try {
        const submissions = [];
        
        // Load submissions for each challenge
        for (let challengeId = 1; challengeId <= 5; challengeId++) {
            try {
                const response = await fetch(`/api/challenges/${challengeId}/submissions`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    submissions.push(...data.submissions);
                }
            } catch (error) {
                console.error(`Erro ao carregar submissões do desafio ${challengeId}:`, error);
            }
        }
        
        allData.submissions = submissions;
    } catch (error) {
        console.error('Erro ao carregar submissões:', error);
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
            allData.challenges = data.challenges;
        }
    } catch (error) {
        console.error('Erro ao carregar desafios:', error);
    }
}

// Update stats display
function updateStatsDisplay() {
    const stats = allData.stats;
    
    document.getElementById('total-groups').textContent = stats.total_groups || 5;
    document.getElementById('total-submissions').textContent = stats.total_submissions || 0;
    document.getElementById('pending-evaluations').textContent = (stats.total_submissions - stats.evaluated_submissions) || 0;
    document.getElementById('completion-rate').textContent = Math.round(stats.evaluation_rate || 0) + '%';
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    renderCurrentTab();
}

// Render current tab
function renderCurrentTab() {
    const activeTab = document.querySelector('.tab-content.active');
    const tabId = activeTab.id;
    
    switch (tabId) {
        case 'overview-tab':
            renderOverview();
            break;
        case 'ranking-tab':
            renderRanking();
            break;
        case 'submissions-tab':
            renderSubmissions();
            break;
        case 'challenges-tab':
            renderChallenges();
            break;
    }
}

// Render overview
function renderOverview() {
    const recentActivity = document.getElementById('recent-activity');
    
    // Get recent submissions
    const recentSubmissions = allData.submissions
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, 10);
    
    if (recentSubmissions.length === 0) {
        recentActivity.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Nenhuma atividade recente</div>';
        return;
    }
    
    recentActivity.innerHTML = recentSubmissions.map(submission => `
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${submission.group_name}</strong> submeteu resposta para 
                <strong>Dia ${getChallengeDay(submission.challenge_id)}</strong>
                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${formatDate(submission.submitted_at)}
                </div>
            </div>
            <div>
                ${submission.score !== null ? 
                    `<span class="status-badge status-evaluated">Avaliado (${submission.score})</span>` :
                    `<span class="status-badge status-pending">Pendente</span>`
                }
            </div>
        </div>
    `).join('');
}

// Render ranking
function renderRanking() {
    const rankingList = document.getElementById('ranking-list');
    
    if (allData.groups.length === 0) {
        rankingList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Nenhum grupo encontrado</div>';
        return;
    }
    
    rankingList.innerHTML = allData.groups.map(group => `
        <div class="table-row">
            <div style="text-align: center; font-weight: 700; color: var(--primary-color);">${group.position}</div>
            <div>
                <strong>${group.name}</strong>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${group.completion_percentage.toFixed(1)}% concluído</div>
            </div>
            <div class="hide-mobile">${group.leader_name}</div>
            <div style="text-align: center; font-weight: 700; color: var(--success-color);">${group.total_score}</div>
            <div class="hide-mobile">
                <button class="action-btn btn-view" onclick="viewGroupDetails(${group.id})">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
            </div>
        </div>
    `).join('');
}

// Render submissions
function renderSubmissions() {
    const submissionsList = document.getElementById('submissions-list');
    
    if (allData.submissions.length === 0) {
        submissionsList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Nenhuma submissão encontrada</div>';
        return;
    }
    
    // Sort submissions by date (newest first)
    const sortedSubmissions = allData.submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    
    submissionsList.innerHTML = sortedSubmissions.map(submission => `
        <div class="table-row">
            <div style="text-align: center; font-weight: 600;">#${submission.id}</div>
            <div>
                <strong>${submission.group_name}</strong>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${submission.leader_name}</div>
            </div>
            <div class="hide-mobile">Dia ${getChallengeDay(submission.challenge_id)}</div>
            <div>
                ${submission.score !== null ? 
                    `<span class="status-badge status-evaluated">Avaliado</span>` :
                    `<span class="status-badge status-pending">Pendente</span>`
                }
            </div>
            <div class="hide-mobile" style="font-size: 0.875rem;">${formatDate(submission.submitted_at)}</div>
            <div>
                ${submission.score !== null ? 
                    `<button class="action-btn btn-view" onclick="viewSubmission(${submission.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>` :
                    `<button class="action-btn btn-evaluate" onclick="evaluateSubmission(${submission.id})">
                        <i class="fas fa-star"></i>
                        Avaliar
                    </button>`
                }
            </div>
        </div>
    `).join('');
}

// Render challenges
function renderChallenges() {
    const challengesList = document.getElementById('challenges-list');
    
    if (allData.challenges.length === 0) {
        challengesList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Nenhum desafio encontrado</div>';
        return;
    }
    
    challengesList.innerHTML = allData.challenges.map(challenge => {
        const submissions = allData.submissions.filter(s => s.challenge_id === challenge.id);
        const submissionCount = submissions.length;
        
        return `
            <div class="table-row">
                <div style="text-align: center; font-weight: 700; color: var(--primary-color);">${challenge.day}</div>
                <div>
                    <strong>${challenge.title}</strong>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${challenge.description}</div>
                </div>
                <div class="hide-mobile" style="text-align: center;">${submissionCount}/5</div>
                <div>
                    <span class="status-badge status-active">Ativo</span>
                </div>
                <div class="hide-mobile">
                    <button class="action-btn btn-view" onclick="viewChallenge(${challenge.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Evaluate submission
function evaluateSubmission(submissionId) {
    const submission = allData.submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const challenge = allData.challenges.find(c => c.id === submission.challenge_id);
    if (!challenge) return;
    
    currentSubmission = submission;
    
    // Populate submission details
    const submissionDetails = document.getElementById('submission-details');
    submissionDetails.innerHTML = `
        <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h4>Dia ${challenge.day}: ${challenge.title}</h4>
            <p><strong>Grupo:</strong> ${submission.group_name} (${submission.leader_name})</p>
            <p><strong>Submetido em:</strong> ${formatDate(submission.submitted_at)}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h4>Respostas do Grupo</h4>
            ${Object.entries(submission.answers).map(([key, answer], index) => `
                <div style="margin-bottom: 1rem;">
                    <strong>Questão ${index + 1}:</strong> ${challenge.questions[index]}
                    <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-top: 0.5rem; border-left: 4px solid var(--primary-color);">
                        ${answer}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Set max score
    document.getElementById('max-score').textContent = challenge.max_score;
    document.getElementById('score').max = challenge.max_score;
    
    // Clear form
    document.getElementById('evaluation-form').reset();
    
    // Show modal
    document.getElementById('evaluation-modal').style.display = 'block';
}

// Submit evaluation
document.getElementById('evaluation-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentSubmission) return;
    
    try {
        const formData = new FormData(e.target);
        const score = parseInt(formData.get('score'));
        const feedback = formData.get('feedback');
        
        showLoading(e.target);
        
        const response = await fetch(`/api/submissions/${currentSubmission.id}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                score: score,
                feedback: feedback
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Submissão avaliada com sucesso!', 'success');
            closeEvaluationModal();
            loadAdminData(); // Reload data
        } else {
            showAlert(data.message || 'Erro ao avaliar submissão', 'error');
        }
    } catch (error) {
        console.error('Erro ao avaliar:', error);
        showAlert('Erro de conexão. Tente novamente.', 'error');
    } finally {
        hideLoading(e.target);
    }
});

// View submission
function viewSubmission(submissionId) {
    const submission = allData.submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const challenge = allData.challenges.find(c => c.id === submission.challenge_id);
    if (!challenge) return;
    
    document.getElementById('view-modal-title').textContent = `Submissão - Dia ${challenge.day}`;
    
    document.getElementById('view-modal-body').innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h4>${challenge.title}</h4>
            <p><strong>Grupo:</strong> ${submission.group_name} (${submission.leader_name})</p>
            <p><strong>Submetido em:</strong> ${formatDate(submission.submitted_at)}</p>
            ${submission.evaluated_at ? `<p><strong>Avaliado em:</strong> ${formatDate(submission.evaluated_at)}</p>` : ''}
        </div>
        
        ${submission.score !== null ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--success-color);">${submission.score}</div>
                    <div style="color: var(--text-secondary);">Pontuação</div>
                </div>
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${challenge.max_score}</div>
                    <div style="color: var(--text-secondary);">Máximo</div>
                </div>
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">${Math.round((submission.score / challenge.max_score) * 100)}%</div>
                    <div style="color: var(--text-secondary);">Aproveitamento</div>
                </div>
            </div>
        ` : ''}
        
        ${submission.feedback ? `
            <div style="margin-bottom: 2rem;">
                <h4>Feedback</h4>
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                    ${submission.feedback}
                </div>
            </div>
        ` : ''}
        
        <div>
            <h4>Respostas</h4>
            ${Object.entries(submission.answers).map(([key, answer], index) => `
                <div style="margin-bottom: 1rem;">
                    <strong>Questão ${index + 1}:</strong> ${challenge.questions[index]}
                    <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                        ${answer}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('view-modal').style.display = 'block';
}

// View group details
function viewGroupDetails(groupId) {
    const group = allData.groups.find(g => g.id === groupId);
    if (!group) return;
    
    document.getElementById('view-modal-title').textContent = `Detalhes - ${group.name}`;
    
    const groupSubmissions = allData.submissions.filter(s => s.group_id === groupId);
    
    document.getElementById('view-modal-body').innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h4>${group.name}</h4>
            <p><strong>Líder:</strong> ${group.leader_name}</p>
            <p><strong>Posição no Ranking:</strong> ${group.position}º lugar</p>
            <p><strong>Pontuação Total:</strong> ${group.total_score} pontos</p>
            <p><strong>Taxa de Conclusão:</strong> ${group.completion_percentage.toFixed(1)}%</p>
        </div>
        
        <div>
            <h4>Submissões por Dia</h4>
            ${Object.entries(group.daily_scores || {}).map(([day, data]) => `
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>Dia ${day}</strong>
                        <span style="color: ${data.evaluated ? 'var(--success-color)' : 'var(--warning-color)'};">
                            ${data.evaluated ? `${data.score}/${data.max_score} pontos` : 'Pendente'}
                        </span>
                    </div>
                    ${data.submitted_at ? `
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
                            Submetido em: ${formatDate(data.submitted_at)}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('view-modal').style.display = 'block';
}

// View challenge
function viewChallenge(challengeId) {
    const challenge = allData.challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const challengeSubmissions = allData.submissions.filter(s => s.challenge_id === challengeId);
    
    document.getElementById('view-modal-title').textContent = `Dia ${challenge.day}: ${challenge.title}`;
    
    document.getElementById('view-modal-body').innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h4>${challenge.title}</h4>
            <p>${challenge.description}</p>
            <p><strong>Pontuação Máxima:</strong> ${challenge.max_score} pontos</p>
            <p><strong>Submissões:</strong> ${challengeSubmissions.length}/5 grupos</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4>Cenário</h4>
            <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; line-height: 1.6;">
                ${challenge.scenario}
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4>Questões</h4>
            <ol style="padding-left: 1.5rem;">
                ${challenge.questions.map(q => `<li style="margin-bottom: 0.5rem;">${q}</li>`).join('')}
            </ol>
        </div>
        
        <div>
            <h4>Status das Submissões</h4>
            ${challengeSubmissions.length > 0 ? challengeSubmissions.map(submission => `
                <div style="background: var(--background-light); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <span><strong>${submission.group_name}</strong></span>
                    <span style="color: ${submission.score !== null ? 'var(--success-color)' : 'var(--warning-color)'};">
                        ${submission.score !== null ? `${submission.score}/${challenge.max_score} pontos` : 'Pendente'}
                    </span>
                </div>
            `).join('') : '<p style="color: var(--text-secondary);">Nenhuma submissão ainda</p>'}
        </div>
    `;
    
    document.getElementById('view-modal').style.display = 'block';
}

// Close modals
function closeEvaluationModal() {
    document.getElementById('evaluation-modal').style.display = 'none';
    currentSubmission = null;
}

function closeViewModal() {
    document.getElementById('view-modal').style.display = 'none';
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
function getChallengeDay(challengeId) {
    const challenge = allData.challenges.find(c => c.id === challengeId);
    return challenge ? challenge.day : challengeId;
}

function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

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
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }
}

function hideLoading(element) {
    element.classList.remove('loading');
    const submitBtn = element.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Salvar Avaliação';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const evaluationModal = document.getElementById('evaluation-modal');
    const viewModal = document.getElementById('view-modal');
    
    if (e.target === evaluationModal) {
        closeEvaluationModal();
    }
    
    if (e.target === viewModal) {
        closeViewModal();
    }
});

// Auto-refresh data every 30 seconds
setInterval(() => {
    loadAdminData();
}, 30000);

