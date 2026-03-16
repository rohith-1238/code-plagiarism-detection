"""
Analysis Routes  –  GET /api/analysis/<id>
History Routes   –  GET /api/history
                    DELETE /api/history/<id>
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, Analysis

analysis_bp = Blueprint('analysis', __name__)
history_bp  = Blueprint('history',  __name__)


# ── Analysis detail ───────────────────────────────────────────

@analysis_bp.route('/analysis/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    """Fetch a single analysis result (must belong to authenticated user)."""
    user_id  = int(get_jwt_identity())
    analysis = Analysis.query.filter_by(
        analysis_id=analysis_id, user_id=user_id
    ).first()

    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404

    return jsonify({'analysis': analysis.to_dict()}), 200


# ── History ───────────────────────────────────────────────────

@history_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Return all past analyses for the authenticated user (newest first)."""
    user_id  = int(get_jwt_identity())
    analyses = (
        Analysis.query
        .filter_by(user_id=user_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return jsonify({
        'history': [a.to_dict() for a in analyses],
        'count':   len(analyses),
    }), 200


@history_bp.route('/history/<int:analysis_id>', methods=['DELETE'])
@jwt_required()
def delete_analysis(analysis_id):
    """Delete a specific analysis record."""
    user_id  = int(get_jwt_identity())
    analysis = Analysis.query.filter_by(
        analysis_id=analysis_id, user_id=user_id
    ).first()

    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404

    db.session.delete(analysis)
    db.session.commit()
    return jsonify({'message': 'Analysis deleted'}), 200
