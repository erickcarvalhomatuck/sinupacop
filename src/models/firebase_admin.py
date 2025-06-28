from src.firebase_config import get_firestore_client
from datetime import datetime
import hashlib

class FirebaseAdmin:
    def __init__(self):
        self.db = get_firestore_client()
        self.collection = 'admins'
    
    def create_admin(self, username, password):
        """Criar um novo administrador"""
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        admin_data = {
            'username': username,
            'password': hashed_password,
            'created_at': datetime.now(),
            'last_login': None
        }
        
        self.db.collection(self.collection).document(username).set(admin_data)
        return admin_data
    
    def get_admin_by_username(self, username):
        """Buscar administrador por username"""
        doc = self.db.collection(self.collection).document(username).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def verify_password(self, username, password):
        """Verificar senha do administrador"""
        admin = self.get_admin_by_username(username)
        if admin:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            return admin['password'] == hashed_password
        return False
    
    def update_last_login(self, username):
        """Atualizar último login do administrador"""
        admin_ref = self.db.collection(self.collection).document(username)
        admin_ref.update({
            'last_login': datetime.now()
        })

