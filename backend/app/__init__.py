"""
Flask Application Factory
"""

from flask import Flask
from flask_cors import CORS


def create_app():
    """Create and configure the Flask application"""
    
    app = Flask(__name__)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['JSON_AS_ASCII'] = False  # Support Hindi characters
    
    # Enable CORS for all routes
    CORS(app, 
         origins=["http://localhost:5173", "http://localhost:3000"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)
    
    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.document_routes import document_bp
    from app.routes.issue_routes import issue_bp
    from app.routes.legal_aid_routes import legal_aid_bp
    from app.routes.draft_routes import draft_bp
    from app.routes.scheme_routes import scheme_bp
    from app.routes.legal_education_routes import legal_education_bp
    from app.routes.chatbot_routes import chatbot_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(document_bp, url_prefix='/api')
    app.register_blueprint(issue_bp, url_prefix='/api')
    app.register_blueprint(legal_aid_bp, url_prefix='/api')
    app.register_blueprint(draft_bp, url_prefix='/api')
    app.register_blueprint(scheme_bp, url_prefix='/api')
    app.register_blueprint(legal_education_bp, url_prefix='/api/legal-education')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            'status': 'healthy',
            'message': 'Rural Legal Saathi API is running',
            'version': '1.0.0'
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {
            'success': False,
            'error': 'Endpoint not found',
            'message': 'यह API endpoint उपलब्ध नहीं है'
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {
            'success': False,
            'error': 'Internal server error',
            'message': 'सर्वर में कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।'
        }, 500
    
    @app.errorhandler(413)
    def file_too_large(error):
        return {
            'success': False,
            'error': 'File too large',
            'message': 'फ़ाइल का आकार 16MB से कम होना चाहिए'
        }, 413
    
    return app
