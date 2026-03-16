"""
SQLAlchemy Database Models
"""

import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication."""
    __tablename__ = 'users'

    user_id    = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    analyses = db.relationship('Analysis', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'user_id':    self.user_id,
            'name':       self.name,
            'email':      self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Analysis(db.Model):
    """Stores plagiarism analysis results."""
    __tablename__ = 'analysis'

    analysis_id     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    file_names      = db.Column(db.Text, nullable=False)   # JSON string
    similarity_score = db.Column(db.Float, nullable=False)
    algorithm       = db.Column(db.String(50), default='cosine')
    language        = db.Column(db.String(50))
    result_json     = db.Column(db.Text)                    # Full JSON result
    report_path     = db.Column(db.String(255))
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    def get_file_names(self):
        try:
            return json.loads(self.file_names)
        except Exception:
            return []

    def get_result(self):
        try:
            return json.loads(self.result_json) if self.result_json else {}
        except Exception:
            return {}

    def to_dict(self):
        return {
            'analysis_id':     self.analysis_id,
            'user_id':         self.user_id,
            'file_names':      self.get_file_names(),
            'similarity_score': round(self.similarity_score, 2),
            'algorithm':       self.algorithm,
            'language':        self.language,
            'result':          self.get_result(),
            'created_at':      self.created_at.isoformat() if self.created_at else None,
        }
