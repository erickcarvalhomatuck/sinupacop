from src.firebase_config import get_firestore_client
from datetime import datetime

class FirebaseSubmission:
    def __init__(self):
        self.db = get_firestore_client()
        self.collection = 'submissions'
    
    def create_submission(self, group_id, challenge_day, answers, submitted_by=""):
        """Criar uma nova submissão"""
        submission_id = f"group_{group_id}_day_{challenge_day}"
        
        submission_data = {
            'id': submission_id,
            'group_id': group_id,
            'challenge_day': challenge_day,
            'answers': answers,
            'submitted_by': submitted_by,
            'submitted_at': datetime.now(),
            'status': 'pending',  # pending, evaluated
            'score': 0,
            'feedback': '',
            'evaluated_at': None,
            'evaluated_by': ''
        }
        
        self.db.collection(self.collection).document(submission_id).set(submission_data)
        return submission_data
    
    def get_submission(self, group_id, challenge_day):
        """Buscar submissão específica"""
        submission_id = f"group_{group_id}_day_{challenge_day}"
        doc = self.db.collection(self.collection).document(submission_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def get_submissions_by_group(self, group_id):
        """Buscar todas as submissões de um grupo"""
        docs = self.db.collection(self.collection).where('group_id', '==', group_id).stream()
        submissions = []
        for doc in docs:
            submission_data = doc.to_dict()
            submissions.append(submission_data)
        return sorted(submissions, key=lambda x: x.get('challenge_day', 0))
    
    def get_submissions_by_day(self, challenge_day):
        """Buscar todas as submissões de um dia específico"""
        docs = self.db.collection(self.collection).where('challenge_day', '==', challenge_day).stream()
        submissions = []
        for doc in docs:
            submission_data = doc.to_dict()
            submissions.append(submission_data)
        return submissions
    
    def get_all_submissions(self):
        """Buscar todas as submissões"""
        docs = self.db.collection(self.collection).stream()
        submissions = []
        for doc in docs:
            submission_data = doc.to_dict()
            submissions.append(submission_data)
        return submissions
    
    def get_pending_submissions(self):
        """Buscar submissões pendentes de avaliação"""
        docs = self.db.collection(self.collection).where('status', '==', 'pending').stream()
        submissions = []
        for doc in docs:
            submission_data = doc.to_dict()
            submissions.append(submission_data)
        return submissions
    
    def evaluate_submission(self, group_id, challenge_day, score, feedback, evaluated_by):
        """Avaliar uma submissão"""
        submission_id = f"group_{group_id}_day_{challenge_day}"
        submission_ref = self.db.collection(self.collection).document(submission_id)
        
        submission_ref.update({
            'score': score,
            'feedback': feedback,
            'status': 'evaluated',
            'evaluated_at': datetime.now(),
            'evaluated_by': evaluated_by
        })
        
        return True
    
    def update_submission(self, group_id, challenge_day, answers):
        """Atualizar uma submissão existente"""
        submission_id = f"group_{group_id}_day_{challenge_day}"
        submission_ref = self.db.collection(self.collection).document(submission_id)
        
        submission_ref.update({
            'answers': answers,
            'submitted_at': datetime.now(),
            'status': 'pending'  # Reset status to pending when updated
        })
        
        return True

