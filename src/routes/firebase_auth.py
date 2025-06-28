from flask import Blueprint, request, jsonify
import jwt
from datetime import datetime, timedelta
from src.models.firebase_group import FirebaseGroup
from src.models.firebase_admin import FirebaseAdmin

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = 'sinupa-cop-2025-secret-key'

@auth_bp.route('/auth/group', methods=['POST'])
def login_group():
    """Login para grupos"""
    try:
        data = request.get_json()
        group_id = data.get('group_id')
        password = data.get('password')
        
        if not group_id or not password:
            return jsonify({'error': 'Group ID e senha são obrigatórios'}), 400
        
        firebase_group = FirebaseGroup()
        
        # Verificar se o grupo existe e a senha está correta
        if firebase_group.verify_password(group_id, password):
            group = firebase_group.get_group_by_id(group_id)
            
            # Gerar token JWT
            payload = {
                'group_id': group_id,
                'group_name': group['name'],
                'type': 'group',
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'success': True,
                'token': token,
                'group': {
                    'id': group['id'],
                    'name': group['name'],
                    'total_score': group.get('total_score', 0),
                    'challenges_completed': group.get('challenges_completed', 0)
                }
            })
        else:
            return jsonify({'error': 'Credenciais inválidas'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/auth/admin', methods=['POST'])
def login_admin():
    """Login para administradores"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400
        
        firebase_admin = FirebaseAdmin()
        
        # Verificar se o admin existe e a senha está correta
        if firebase_admin.verify_password(username, password):
            # Atualizar último login
            firebase_admin.update_last_login(username)
            
            # Gerar token JWT
            payload = {
                'username': username,
                'type': 'admin',
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'success': True,
                'token': token,
                'admin': {
                    'username': username
                }
            })
        else:
            return jsonify({'error': 'Credenciais inválidas'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/auth/verify', methods=['POST'])
def verify_token():
    """Verificar token JWT"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token é obrigatório'}), 400
        
        # Decodificar token
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        return jsonify({
            'success': True,
            'payload': payload
        })
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

