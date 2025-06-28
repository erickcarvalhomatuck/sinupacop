from flask import Blueprint, request, jsonify
import jwt
from src.models.firebase_challenge import FirebaseChallenge
from src.models.firebase_submission import FirebaseSubmission
from src.models.firebase_group import FirebaseGroup

challenges_bp = Blueprint('challenges', __name__)

SECRET_KEY = 'sinupa-cop-2025-secret-key'

def verify_token_middleware(token):
    """Middleware para verificar token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except:
        return None

@challenges_bp.route('/challenges', methods=['GET'])
def get_challenges():
    """Buscar todos os desafios"""
    try:
        firebase_challenge = FirebaseChallenge()
        challenges = firebase_challenge.get_active_challenges()
        
        return jsonify({
            'success': True,
            'challenges': challenges
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@challenges_bp.route('/challenges/<int:day>', methods=['GET'])
def get_challenge_by_day(day):
    """Buscar desafio por dia"""
    try:
        firebase_challenge = FirebaseChallenge()
        challenge = firebase_challenge.get_challenge_by_day(day)
        
        if challenge:
            return jsonify({
                'success': True,
                'challenge': challenge
            })
        else:
            return jsonify({'error': 'Desafio não encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@challenges_bp.route('/challenges/<int:day>/submit', methods=['POST'])
def submit_challenge(day):
    """Submeter resposta para um desafio"""
    try:
        # Verificar token
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = verify_token_middleware(token)
        
        if not payload or payload.get('type') != 'group':
            return jsonify({'error': 'Token inválido ou não autorizado'}), 401
        
        group_id = payload.get('group_id')
        data = request.get_json()
        answers = data.get('answers', [])
        
        if not answers:
            return jsonify({'error': 'Respostas são obrigatórias'}), 400
        
        firebase_submission = FirebaseSubmission()
        
        # Verificar se já existe uma submissão
        existing_submission = firebase_submission.get_submission(group_id, day)
        
        if existing_submission:
            # Atualizar submissão existente
            firebase_submission.update_submission(group_id, day, answers)
            message = 'Submissão atualizada com sucesso'
        else:
            # Criar nova submissão
            firebase_submission.create_submission(group_id, day, answers)
            message = 'Submissão criada com sucesso'
        
        return jsonify({
            'success': True,
            'message': message
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@challenges_bp.route('/challenges/<int:day>/submission', methods=['GET'])
def get_submission(day):
    """Buscar submissão de um grupo para um desafio"""
    try:
        # Verificar token
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = verify_token_middleware(token)
        
        if not payload or payload.get('type') != 'group':
            return jsonify({'error': 'Token inválido ou não autorizado'}), 401
        
        group_id = payload.get('group_id')
        firebase_submission = FirebaseSubmission()
        submission = firebase_submission.get_submission(group_id, day)
        
        if submission:
            return jsonify({
                'success': True,
                'submission': submission
            })
        else:
            return jsonify({
                'success': True,
                'submission': None
            })
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@challenges_bp.route('/admin/submissions', methods=['GET'])
def get_all_submissions():
    """Buscar todas as submissões (admin)"""
    try:
        # Verificar token de admin
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = verify_token_middleware(token)
        
        if not payload or payload.get('type') != 'admin':
            return jsonify({'error': 'Token inválido ou não autorizado'}), 401
        
        firebase_submission = FirebaseSubmission()
        submissions = firebase_submission.get_all_submissions()
        
        return jsonify({
            'success': True,
            'submissions': submissions
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@challenges_bp.route('/admin/submissions/pending', methods=['GET'])
def get_pending_submissions():
    """Buscar submissões pendentes (admin)"""
    try:
        # Verificar token de admin
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = verify_token_middleware(token)
        
        if not payload or payload.get('type') != 'admin':
            return jsonify({'error': 'Token inválido ou não autorizado'}), 401
        
        firebase_submission = FirebaseSubmission()
        submissions = firebase_submission.get_pending_submissions()
        
        return jsonify({
            'success': True,
            'submissions': submissions
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@challenges_bp.route('/admin/submissions/evaluate', methods=['POST'])
def evaluate_submission():
    """Avaliar uma submissão (admin)"""
    try:
        # Verificar token de admin
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = verify_token_middleware(token)
        
        if not payload or payload.get('type') != 'admin':
            return jsonify({'error': 'Token inválido ou não autorizado'}), 401
        
        data = request.get_json()
        group_id = data.get('group_id')
        challenge_day = data.get('challenge_day')
        score = data.get('score', 0)
        feedback = data.get('feedback', '')
        
        if not group_id or not challenge_day:
            return jsonify({'error': 'Group ID e dia do desafio são obrigatórios'}), 400
        
        firebase_submission = FirebaseSubmission()
        firebase_group = FirebaseGroup()
        
        # Avaliar submissão
        firebase_submission.evaluate_submission(
            group_id, challenge_day, score, feedback, payload.get('username')
        )
        
        # Atualizar pontuação do grupo
        firebase_group.update_score(group_id, score)
        
        return jsonify({
            'success': True,
            'message': 'Submissão avaliada com sucesso'
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

