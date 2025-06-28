from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    scenario = db.Column(db.Text, nullable=False)
    questions = db.Column(db.Text, nullable=False)  # JSON string
    max_score = db.Column(db.Integer, default=100)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Challenge Day {self.day}: {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'day': self.day,
            'title': self.title,
            'description': self.description,
            'scenario': self.scenario,
            'questions': self.questions,
            'max_score': self.max_score,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

