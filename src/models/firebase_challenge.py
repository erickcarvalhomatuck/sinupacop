from src.firebase_config import get_firestore_client
from datetime import datetime

class FirebaseChallenge:
    def __init__(self):
        self.db = get_firestore_client()
        self.collection = 'challenges'
    
    def create_challenge(self, day, title, description, questions, max_score=100):
        """Criar um novo desafio"""
        challenge_data = {
            'day': day,
            'title': title,
            'description': description,
            'questions': questions,
            'max_score': max_score,
            'created_at': datetime.now(),
            'is_active': True
        }
        
        self.db.collection(self.collection).document(f'day_{day}').set(challenge_data)
        return challenge_data
    
    def get_challenge_by_day(self, day):
        """Buscar desafio por dia"""
        doc = self.db.collection(self.collection).document(f'day_{day}').get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def get_all_challenges(self):
        """Buscar todos os desafios"""
        docs = self.db.collection(self.collection).stream()
        challenges = []
        for doc in docs:
            challenge_data = doc.to_dict()
            challenges.append(challenge_data)
        return sorted(challenges, key=lambda x: x.get('day', 0))
    
    def get_active_challenges(self):
        """Buscar desafios ativos"""
        docs = self.db.collection(self.collection).where('is_active', '==', True).stream()
        challenges = []
        for doc in docs:
            challenge_data = doc.to_dict()
            challenges.append(challenge_data)
        return sorted(challenges, key=lambda x: x.get('day', 0))

