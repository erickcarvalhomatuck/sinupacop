from flask import Blueprint, request, jsonify
import json
from src.models.user import db
from src.models.challenge import Challenge
from src.models.submission import Submission
from src.routes.auth import require_auth

challenges_bp = Blueprint('challenges', __name__)

@challenges_bp.route('/challenges', methods=['GET'])
def get_challenges():
    """Obter todos os desafios ativos"""
    try:
        challenges = Challenge.query.filter_by(is_active=True).order_by(Challenge.day).all()
        
        challenges_data = []
        for challenge in challenges:
            challenge_dict = challenge.to_dict()
            # Parse questions JSON
            try:
                challenge_dict['questions'] = json.loads(challenge.questions)
            except:
                challenge_dict['questions'] = []
            challenges_data.append(challenge_dict)
        
        return jsonify({
            'challenges': challenges_data
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter desafios: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@challenges_bp.route('/challenges/<int:challenge_id>', methods=['GET'])
def get_challenge(challenge_id):
    """Obter um desafio específico"""
    try:
        challenge = Challenge.query.get(challenge_id)
        
        if not challenge:
            return jsonify({'message': 'Desafio não encontrado'}), 404
        
        if not challenge.is_active:
            return jsonify({'message': 'Desafio inativo'}), 403
        
        challenge_dict = challenge.to_dict()
        # Parse questions JSON
        try:
            challenge_dict['questions'] = json.loads(challenge.questions)
        except:
            challenge_dict['questions'] = []
        
        return jsonify({
            'challenge': challenge_dict
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter desafio: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@challenges_bp.route('/challenges/<int:challenge_id>/submit', methods=['POST'])
@require_auth('group')
def submit_challenge(challenge_id):
    """Submeter resposta para um desafio"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Dados não fornecidos'}), 400
        
        answers = data.get('answers')
        
        if not answers:
            return jsonify({'message': 'Respostas são obrigatórias'}), 400
        
        # Verificar se o desafio existe
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return jsonify({'message': 'Desafio não encontrado'}), 404
        
        if not challenge.is_active:
            return jsonify({'message': 'Desafio inativo'}), 403
        
        group_id = request.user.get('group_id')
        
        # Verificar se já existe uma submissão para este grupo e desafio
        existing_submission = Submission.query.filter_by(
            group_id=group_id,
            challenge_id=challenge_id
        ).first()
        
        if existing_submission:
            return jsonify({'message': 'Resposta já foi submetida para este desafio'}), 400
        
        # Criar nova submissão
        submission = Submission(
            group_id=group_id,
            challenge_id=challenge_id,
            answers=json.dumps(answers)
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify({
            'message': 'Resposta submetida com sucesso',
            'submission': submission.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Erro ao submeter desafio: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@challenges_bp.route('/challenges/<int:challenge_id>/submissions', methods=['GET'])
@require_auth('admin')
def get_challenge_submissions(challenge_id):
    """Obter todas as submissões de um desafio (admin only)"""
    try:
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return jsonify({'message': 'Desafio não encontrado'}), 404
        
        submissions = Submission.query.filter_by(challenge_id=challenge_id).all()
        
        submissions_data = []
        for submission in submissions:
            submission_dict = submission.to_dict()
            # Parse answers JSON
            try:
                submission_dict['answers'] = json.loads(submission.answers)
            except:
                submission_dict['answers'] = {}
            
            # Adicionar informações do grupo
            if submission.group:
                submission_dict['group_name'] = submission.group.name
                submission_dict['leader_name'] = submission.group.leader_name
            
            submissions_data.append(submission_dict)
        
        return jsonify({
            'submissions': submissions_data,
            'challenge': challenge.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter submissões: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@challenges_bp.route('/submissions/<int:submission_id>/evaluate', methods=['POST'])
@require_auth('admin')
def evaluate_submission(submission_id):
    """Avaliar uma submissão (admin only)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Dados não fornecidos'}), 400
        
        score = data.get('score')
        feedback = data.get('feedback', '')
        
        if score is None:
            return jsonify({'message': 'Pontuação é obrigatória'}), 400
        
        # Verificar se a submissão existe
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({'message': 'Submissão não encontrada'}), 404
        
        # Atualizar submissão
        submission.score = score
        submission.feedback = feedback
        submission.evaluated_at = db.func.current_timestamp()
        submission.evaluated_by = request.user.get('username')
        
        # Atualizar pontuação total do grupo
        group = submission.group
        if group:
            # Recalcular pontuação total
            total_score = db.session.query(db.func.sum(Submission.score)).filter_by(group_id=group.id).scalar()
            group.total_score = total_score or 0
        
        db.session.commit()
        
        return jsonify({
            'message': 'Submissão avaliada com sucesso',
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Erro ao avaliar submissão: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@challenges_bp.route('/my-submissions', methods=['GET'])
@require_auth('group')
def get_my_submissions():
    """Obter submissões do grupo logado"""
    try:
        group_id = request.user.get('group_id')
        
        submissions = Submission.query.filter_by(group_id=group_id).all()
        
        submissions_data = []
        for submission in submissions:
            submission_dict = submission.to_dict()
            # Parse answers JSON
            try:
                submission_dict['answers'] = json.loads(submission.answers)
            except:
                submission_dict['answers'] = {}
            
            # Adicionar informações do desafio
            if submission.challenge:
                submission_dict['challenge_title'] = submission.challenge.title
                submission_dict['challenge_day'] = submission.challenge.day
                submission_dict['max_score'] = submission.challenge.max_score
            
            submissions_data.append(submission_dict)
        
        return jsonify({
            'submissions': submissions_data
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter minhas submissões: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

