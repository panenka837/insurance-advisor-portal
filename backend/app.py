from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure CORS
allowed_origins = [
    'http://localhost:5173',  # Local development
    'https://insurance-advisor-portal.windsurf.build',  # Production
]

CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuratie
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///insurance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = os.getenv('SMTP_HOST')
app.config['MAIL_PORT'] = int(os.getenv('SMTP_PORT'))
app.config['MAIL_USERNAME'] = os.getenv('SMTP_USER')
app.config['MAIL_PASSWORD'] = os.getenv('SMTP_PASS')
app.config['MAIL_USE_TLS'] = True
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # Longer token expiry for demo
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
mail = Mail(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='client')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.email}>'

class Policy(db.Model):
    __tablename__ = 'policies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    dekking = db.Column(db.String(100), nullable=False)
    premie = db.Column(db.Float, nullable=False)
    vervaldatum = db.Column(db.DateTime, nullable=False)
    claims = db.relationship('Claim', backref='policy', lazy=True)
    payments = db.relationship('Payment', backref='policy', lazy=True)

class Claim(db.Model):
    __tablename__ = 'claims'
    id = db.Column(db.Integer, primary_key=True)
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    document_url = db.Column(db.String(200))

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    policy_id = db.Column(db.Integer, db.ForeignKey('policies.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    bedrag = db.Column(db.Float, nullable=False)
    betaaldatum = db.Column(db.DateTime)

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Vul alle velden in'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Ongeldige inloggegevens'}), 401
    
    access_token = create_access_token(identity={
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.name
    })
    
    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user = get_jwt_identity()
    return jsonify(current_user)

# Protected route example
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'logged_in_as': current_user})

# Create tables
with app.app_context():
    db.create_all()
    
    # Create default users if they don't exist
    admin = User.query.filter_by(email='admin@riskproactief.nl').first()
    if not admin:
        admin = User(
            email='admin@riskproactief.nl',
            password=generate_password_hash('admin123'),
            name='Admin',
            role='admin'
        )
        db.session.add(admin)

    regular_user = User.query.filter_by(email='user@riskproactief.nl').first()
    if not regular_user:
        regular_user = User(
            email='user@riskproactief.nl',
            password=generate_password_hash('user123'),
            name='Regular User',
            role='user'
        )
        db.session.add(regular_user)

    db.session.commit()

# API Routes
@app.route('/api/policies', methods=['GET'])
def get_policies():
    policies = Policy.query.all()
    return jsonify([{
        'id': p.id,
        'dekking': p.dekking,
        'premie': p.premie,
        'vervaldatum': p.vervaldatum.isoformat(),
        'user_id': p.user_id
    } for p in policies])

@app.route('/api/claims', methods=['GET'])
def get_claims():
    claims = Claim.query.all()
    return jsonify([{
        'id': c.id,
        'policy_id': c.policy_id,
        'status': c.status,
        'document_url': c.document_url
    } for c in claims])

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    # Sample statistics data
    return jsonify({
        'monthly_premiums': {
            'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            'data': [12000, 19000, 15000, 17000, 22000, 24000]
        },
        'claims_by_type': {
            'labels': ['Auto', 'Woning', 'Reis', 'Aansprakelijkheid'],
            'data': [30, 25, 15, 10]
        },
        'customer_growth': {
            'labels': ['Q1', 'Q2', 'Q3', 'Q4'],
            'data': [45, 52, 38, 65]
        },
        'summary': {
            'active_policies': 24,
            'open_claims': 8,
            'total_customers': 156,
            'total_premium': 45200
        }
    })

@app.route('/api/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        
        # E-mail bericht samenstellen
        msg = Message(
            subject=f'Nieuw contactformulier: {data["onderwerp"]}',
            recipients=[os.environ.get('CONTACT_EMAIL', 'default@riskproactief.nl')]
        )
        
        msg.body = f'''
        Naam: {data["naam"]}
        E-mail: {data["email"]}
        Telefoon: {data["telefoon"]}
        Voorkeur contact: {data["voorkeurContact"]}
        Onderwerp: {data["onderwerp"]}
        
        Bericht:
        {data["bericht"]}
        '''
        
        mail.send(msg)
        
        # Automatische bevestiging naar de afzender
        confirmation = Message(
            subject='Ontvangstbevestiging - Risk Pro Actief',
            recipients=[data["email"]]
        )
        
        confirmation.body = f'''
        Beste {data["naam"]},
        
        Bedankt voor uw bericht. Wij hebben uw aanvraag in goede orde ontvangen.
        
        Wij streven ernaar om binnen 24 uur contact met u op te nemen via {data["voorkeurContact"]}.
        
        Met vriendelijke groet,
        Risk Pro Actief Team
        '''
        
        mail.send(confirmation)
        
        return jsonify({'message': 'Bericht succesvol verzonden'}), 200
        
    except Exception as e:
        print('Error:', str(e))  # Voor debugging
        return jsonify({'error': 'Er is een fout opgetreden'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)
