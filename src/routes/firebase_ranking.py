from flask import Blueprint, request, jsonify
import jwt
from src.models.firebase_group import FirebaseGroup
from src.models.firebase_submission import FirebaseSubmission

ranking_bp = Blueprint('ranking', __name__)

SECRET_KEY = 'sinupa-cop-2025-secret-key'

def verify_token_middleware(token):
    """Middleware para verificar token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except:
        return None

@ranking_bp.route('/ranking', methods=['GET'])
def get_ranking():
    """Buscar ranking dos grupos"""
    try:
        firebase_group = FirebaseGroup()
        groups = firebase_group.get_all_groups()
        
        # Formatar dados para o ranking
        ranking_data = []
        for i, group in enumerate(groups):
            ranking_data.append({
                'position': i + 1,
                'group_id': group['id'],
                'group_name': group['name'],
                'total_score': group.get('total_score', 0),
                'challenges_completed': group.get('challenges_completed', 0)
            })
        
        return jsonify({
            'success': True,
            'ranking': ranking_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@ranking_bp.route('/ranking/group/<int:group_id>', methods=['GET'])
def get_group_details(group_id):
    """Buscar detalhes de um grupo específico"""
    try:
        firebase_group = FirebaseGroup()
        firebase_submission = FirebaseSubmission()
        
        group = firebase_group.get_group_by_id(group_id)
        if not group:
            return jsonify({'error': 'Grupo não encontrado'}), 404
        
        submissions = firebase_submission.get_submissions_by_group(group_id)
        
        # Calcular estatísticas
        total_submissions = len(submissions)
        evaluated_submissions = len([s for s in submissions if s.get('status') == 'evaluated'])
        pending_submissions = len([s for s in submissions if s.get('status') == 'pending'])
        
        return jsonify({
            'success': True,
            'group': {
                'id': group['id'],
                'name': group['name'],
                'total_score': group.get('total_score', 0),
                'challenges_completed': group.get('challenges_completed', 0),
                'total_submissions': total_submissions,
                'evaluated_submissions': evaluated_submissions,
                'pending_submissions': pending_submissions,
                'submissions': submissions
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@ranking_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    """Buscar estatísticas gerais (admin)"""
    try:
        # Verificar token de admin
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = verify_token_middleware(token)
        
        if not payload or payload.get('type') != 'admin':
            return jsonify({'error': 'Token inválido ou não autorizado'}), 401
        
        firebase_group = FirebaseGroup()
        firebase_submission = FirebaseSubmission()
        
        groups = firebase_group.get_all_groups()
        all_submissions = firebase_submission.get_all_submissions()
        pending_submissions = firebase_submission.get_pending_submissions()
        
        # Calcular estatísticas
        total_groups = len(groups)
        total_submissions = len(all_submissions)
        total_pending = len(pending_submissions)
        total_evaluated = total_submissions - total_pending
        
        # Calcular pontuação média
        total_score = sum(group.get('total_score', 0) for group in groups)
        average_score = total_score / total_groups if total_groups > 0 else 0
        
        # Grupo com maior pontuação
        top_group = groups[0] if groups else None
        
        return jsonify({
            'success': True,
            'stats': {
                'total_groups': total_groups,
                'total_submissions': total_submissions,
                'pending_submissions': total_pending,
                'evaluated_submissions': total_evaluated,
                'average_score': round(average_score, 2),
                'top_group': {
                    'name': top_group['name'] if top_group else 'N/A',
                    'score': top_group.get('total_score', 0) if top_group else 0
                } if top_group else None
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

