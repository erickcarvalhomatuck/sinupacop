from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import datetime
from src.models.user import db
from src.models.group import Group
from src.models.admin import Admin

auth_bp = Blueprint('auth', __name__)

# Chave secreta para JWT (em produção, use uma chave mais segura)
JWT_SECRET = 'sinupa-cop-2025-secret-key'

@auth_bp.route('/auth/group', methods=['POST'])
def group_login():
    """Login para grupos de delegados"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Dados não fornecidos'}), 400
        
        group_name = data.get('group_name')
        password = data.get('password')
        
        if not group_name or not password:
            return jsonify({'message': 'Nome do grupo e senha são obrigatórios'}), 400
        
        # Buscar grupo no banco de dados
        group = Group.query.filter_by(name=group_name).first()
        
        if not group:
            return jsonify({'message': 'Grupo não encontrado'}), 404
        
        if not group.is_active:
            return jsonify({'message': 'Grupo inativo'}), 403
        
        # Verificar senha (comparação simples por enquanto)
        if group.password != password:
            return jsonify({'message': 'Senha incorreta'}), 401
        
        # Gerar token JWT
        token_payload = {
            'group_id': group.id,
            'group_name': group.name,
            'type': 'group',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        
        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': token,
            'group': group.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Erro no login do grupo: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@auth_bp.route('/auth/admin', methods=['POST'])
def admin_login():
    """Login para administradores"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Dados não fornecidos'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Usuário e senha são obrigatórios'}), 400
        
        # Buscar admin no banco de dados
        admin = Admin.query.filter_by(username=username).first()
        
        if not admin:
            return jsonify({'message': 'Administrador não encontrado'}), 404
        
        if not admin.is_active:
            return jsonify({'message': 'Administrador inativo'}), 403
        
        # Verificar senha (comparação simples por enquanto)
        if admin.password != password:
            return jsonify({'message': 'Senha incorreta'}), 401
        
        # Atualizar último login
        admin.last_login = datetime.datetime.utcnow()
        db.session.commit()
        
        # Gerar token JWT
        token_payload = {
            'admin_id': admin.id,
            'username': admin.username,
            'type': 'admin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        
        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'message': 'Login de administrador realizado com sucesso',
            'token': token,
            'admin': admin.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Erro no login do admin: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@auth_bp.route('/auth/verify', methods=['POST'])
def verify_token():
    """Verificar se o token é válido"""
    try:
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token não fornecido'}), 401
        
        # Remover 'Bearer ' do token se presente
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Decodificar token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        
        return jsonify({
            'message': 'Token válido',
            'payload': payload
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token inválido'}), 401
    except Exception as e:
        print(f"Erro na verificação do token: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """Logout do usuário"""
    try:
        # Limpar sessão se existir
        session.clear()
        
        return jsonify({
            'message': 'Logout realizado com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro no logout: {str(e)}")
        return jsonify({'message': 'Erro interno do servidor'}), 500

def require_auth(user_type=None):
    """Decorator para rotas que requerem autenticação"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            try:
                token = request.headers.get('Authorization')
                
                if not token:
                    return jsonify({'message': 'Token não fornecido'}), 401
                
                # Remover 'Bearer ' do token se presente
                if token.startswith('Bearer '):
                    token = token[7:]
                
                # Decodificar token
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                
                # Verificar tipo de usuário se especificado
                if user_type and payload.get('type') != user_type:
                    return jsonify({'message': 'Tipo de usuário não autorizado'}), 403
                
                # Adicionar payload ao request
                request.user = payload
                
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token expirado'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token inválido'}), 401
            except Exception as e:
                print(f"Erro na autenticação: {str(e)}")
                return jsonify({'message': 'Erro interno do servidor'}), 500
        
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

