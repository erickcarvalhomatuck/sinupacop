from src.firebase_config import get_firestore_client
from datetime import datetime
import hashlib

class FirebaseGroup:
    def __init__(self):
        self.db = get_firestore_client()
        self.collection = 'groups'
    
    def create_group(self, group_id, name, password, leader_name=""):
        """Criar um novo grupo"""
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        group_data = {
            'id': group_id,
            'name': name,
            'password': hashed_password,
            'leader_name': leader_name,
            'total_score': 0,
            'challenges_completed': 0,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        self.db.collection(self.collection).document(str(group_id)).set(group_data)
        return group_data
    
    def get_group_by_id(self, group_id):
        """Buscar grupo por ID"""
        doc = self.db.collection(self.collection).document(str(group_id)).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def verify_password(self, group_id, password):
        """Verificar senha do grupo"""
        group = self.get_group_by_id(group_id)
        if group:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            return group['password'] == hashed_password
        return False
    
    def update_score(self, group_id, score_to_add):
        """Atualizar pontuação do grupo"""
        group_ref = self.db.collection(self.collection).document(str(group_id))
        group_ref.update({
            'total_score': firestore.Increment(score_to_add),
            'updated_at': datetime.now()
        })
    
    def get_all_groups(self):
        """Buscar todos os grupos"""
        docs = self.db.collection(self.collection).stream()
        groups = []
        for doc in docs:
            group_data = doc.to_dict()
            groups.append(group_data)
        return sorted(groups, key=lambda x: x.get('total_score', 0), reverse=True)
    
    def increment_challenges_completed(self, group_id):
        """Incrementar contador de desafios completados"""
        group_ref = self.db.collection(self.collection).document(str(group_id))
        group_ref.update({
            'challenges_completed': firestore.Increment(1),
            'updated_at': datetime.now()
        })

