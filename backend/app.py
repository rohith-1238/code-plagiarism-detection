import os
import nltk
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models.db import db
from routes.auth_routes import auth_bp
from routes.upload_routes import upload_bp
from routes.analysis_routes import analysis_bp, history_bp

load_dotenv()

def download_nltk_data():
    for pkg in ['punkt', 'stopwords', 'wordnet', 'punkt_tab']:
        try:
            nltk.download(pkg, quiet=True)
        except Exception:
            pass

def create_app():
    app = Flask(__name__)

    # Database - auto detect MySQL or SQLite
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        print("Using MySQL database")
    else:
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        app.config['SQLALCHEMY_DATABASE_URI'] = (
            f"sqlite:///{os.path.join(BASE_DIR, 'plagiarism.db')}"
        )
        print("Using SQLite database")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('reports', exist_ok=True)

    # ✅ FIXED CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(analysis_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return {'message': 'CodeScan AI API Running'}, 200

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}, 200

    return app


download_nltk_data()
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables created")
    app.run(debug=False, port=5000)
