"""
Routes package initialization
"""

from app.routes.document_routes import document_bp
from app.routes.issue_routes import issue_bp
from app.routes.legal_aid_routes import legal_aid_bp
from app.routes.draft_routes import draft_bp
from app.routes.scheme_routes import scheme_bp
from app.routes.legal_education_routes import legal_education_bp

__all__ = ['document_bp', 'issue_bp', 'legal_aid_bp', 'draft_bp', 'scheme_bp', 'legal_education_bp']
