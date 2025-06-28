from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    leader_name = db.Column(db.String(100), nullable=False)
    total_score = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Group {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'leader_name': self.leader_name,
            'total_score': self.total_score,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

