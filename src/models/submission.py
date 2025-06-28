from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    answers = db.Column(db.Text, nullable=False)  # JSON string
    score = db.Column(db.Integer, default=0)
    submitted_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    evaluated_at = db.Column(db.DateTime, nullable=True)
    evaluated_by = db.Column(db.String(100), nullable=True)
    feedback = db.Column(db.Text, nullable=True)

    # Relacionamentos
    group = db.relationship('Group', backref=db.backref('submissions', lazy=True))
    challenge = db.relationship('Challenge', backref=db.backref('submissions', lazy=True))

    def __repr__(self):
        return f'<Submission Group {self.group_id} - Challenge {self.challenge_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'challenge_id': self.challenge_id,
            'answers': self.answers,
            'score': self.score,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'evaluated_at': self.evaluated_at.isoformat() if self.evaluated_at else None,
            'evaluated_by': self.evaluated_by,
            'feedback': self.feedback
        }

