from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.group import Group
from src.models.submission import Submission

ranking_bp = Blueprint('ranking', __name__)

@ranking_bp.route('/ranking', methods=['GET'])
def get_ranking():
    """Obter ranking dos grupos"""
    try:
        # Buscar todos os grupos ativos ordenados por pontuação
        groups = Group.query.filter_by(is_active=True).order_by(Group.total_score.desc()).all()
        
        ranking_data = []
        for position, group in enumerate(groups, 1):
            group_dict = group.to_dict()
            group_dict['position'] = position
            
            # Adicionar estatísticas adicionais
            submissions_count = Submission.query.filter_by(group_id=group.id).count()
            evaluated_submissions = Submission.query.filter_by(group_id=group.id).filter(Submission.score.isnot(None)).count()
            
            group_dict['submissions_count'] = submissions_count
            group_dict['evaluated_submissions'] = evaluated_submissions
            group_dict['completion_rate'] = (evaluated_submissions / submissions_count * 100) if submissions_count > 0 else 0
            
            ranking_data.append(group_dict)
        
        return jsonify({
            'ranking': ranking_data,
            'total_groups': len(ranking_data)
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter ranking: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@ranking_bp.route('/ranking/detailed', methods=['GET'])
def get_detailed_ranking():
    """Obter ranking detalhado com submissões por dia"""
    try:
        groups = Group.query.filter_by(is_active=True).order_by(Group.total_score.desc()).all()
        
        detailed_ranking = []
        for position, group in enumerate(groups, 1):
            group_dict = group.to_dict()
            group_dict['position'] = position
            
            # Obter submissões do grupo organizadas por dia
            submissions = Submission.query.filter_by(group_id=group.id).join(
                Submission.challenge
            ).order_by('challenge.day').all()
            
            daily_scores = {}
            total_possible = 0
            
            for submission in submissions:
                day = submission.challenge.day
                daily_scores[day] = {
                    'score': submission.score or 0,
                    'max_score': submission.challenge.max_score,
                    'submitted_at': submission.submitted_at.isoformat() if submission.submitted_at else None,
                    'evaluated': submission.score is not None,
                    'feedback': submission.feedback
                }
                total_possible += submission.challenge.max_score
            
            group_dict['daily_scores'] = daily_scores
            group_dict['total_possible'] = total_possible
            group_dict['completion_percentage'] = (group.total_score / total_possible * 100) if total_possible > 0 else 0
            
            detailed_ranking.append(group_dict)
        
        return jsonify({
            'detailed_ranking': detailed_ranking,
            'total_groups': len(detailed_ranking)
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter ranking detalhado: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@ranking_bp.route('/ranking/group/<int:group_id>', methods=['GET'])
def get_group_ranking(group_id):
    """Obter posição e detalhes de um grupo específico"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'message': 'Grupo não encontrado'}), 404
        
        # Calcular posição do grupo
        better_groups = Group.query.filter(
            Group.total_score > group.total_score,
            Group.is_active == True
        ).count()
        position = better_groups + 1
        
        # Obter estatísticas do grupo
        submissions = Submission.query.filter_by(group_id=group_id).all()
        evaluated_submissions = [s for s in submissions if s.score is not None]
        
        group_stats = {
            'group': group.to_dict(),
            'position': position,
            'total_submissions': len(submissions),
            'evaluated_submissions': len(evaluated_submissions),
            'average_score': sum(s.score for s in evaluated_submissions) / len(evaluated_submissions) if evaluated_submissions else 0,
            'completion_rate': len(evaluated_submissions) / len(submissions) * 100 if submissions else 0
        }
        
        return jsonify(group_stats), 200
        
    except Exception as e:
        print(f"Erro ao obter ranking do grupo: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@ranking_bp.route('/ranking/stats', methods=['GET'])
def get_ranking_stats():
    """Obter estatísticas gerais do ranking"""
    try:
        total_groups = Group.query.filter_by(is_active=True).count()
        total_submissions = Submission.query.count()
        evaluated_submissions = Submission.query.filter(Submission.score.isnot(None)).count()
        
        # Calcular estatísticas de pontuação
        scores = [s.score for s in Submission.query.filter(Submission.score.isnot(None)).all()]
        
        stats = {
            'total_groups': total_groups,
            'total_submissions': total_submissions,
            'evaluated_submissions': evaluated_submissions,
            'evaluation_rate': (evaluated_submissions / total_submissions * 100) if total_submissions > 0 else 0,
            'average_score': sum(scores) / len(scores) if scores else 0,
            'highest_score': max(scores) if scores else 0,
            'lowest_score': min(scores) if scores else 0
        }
        
        # Top 3 grupos
        top_groups = Group.query.filter_by(is_active=True).order_by(Group.total_score.desc()).limit(3).all()
        stats['top_3'] = [group.to_dict() for group in top_groups]
        
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"Erro ao obter estatísticas: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

