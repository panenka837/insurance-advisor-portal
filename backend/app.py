from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import os
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# DEBUG: Toon huidige werkdirectory en databasepad
print('WORKDIR:', os.getcwd())
print('DB PATH:', os.path.abspath('insurance.db'))

load_dotenv()

app = Flask(__name__)

# Configure CORS and basic settings
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///insurance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = os.getenv('SMTP_HOST', 'localhost')
app.config['MAIL_PORT'] = int(os.getenv('SMTP_PORT', '587'))
app.config['MAIL_USERNAME'] = os.getenv('SMTP_USER', '')
app.config['MAIL_PASSWORD'] = os.getenv('SMTP_PASS', '')
app.config['MAIL_USE_TLS'] = True
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
mail = Mail(app)
jwt = JWTManager(app)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://insurance-advisor-portal.vercel.app",
                "http://localhost:5175"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }
)

# Automatisch tabellen aanmaken bij startup (voor Render gratis versie)
with app.app_context():
    db.create_all()

# Models
class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    user = db.relationship('User')

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    naam = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefoon = db.Column(db.String(30))
    onderwerp = db.Column(db.String(200))
    bericht = db.Column(db.Text, nullable=False)
    voorkeur_contact = db.Column(db.String(30))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'naam': self.naam,
            'email': self.email,
            'telefoon': self.telefoon,
            'onderwerp': self.onderwerp,
            'bericht': self.bericht,
            'voorkeur_contact': self.voorkeur_contact,
            'created_at': self.created_at.isoformat()
        }

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

    def set_password(self, password):
        self.password = generate_password_hash(password, method='sha256')

    def check_password(self, password):
        return check_password_hash(self.password, password)

class Policy(db.Model):
    __tablename__ = 'policies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    dekking = db.Column(db.String(100), nullable=False)
    premie = db.Column(db.Float, nullable=False)
    eigen_risico = db.Column(db.Float, nullable=False)
    vervaldatum = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='actief')
    beschrijving = db.Column(db.Text)
    claims = db.relationship('Claim', backref='policy', lazy=True)
    payments = db.relationship('Payment', backref='policy', lazy=True)

    def to_dict(self):
        try:
            return {
                'id': self.id,
                'type': self.type,
                'dekking': self.dekking,
                'premie': float(self.premie),
                'eigen_risico': float(self.eigen_risico),
                'vervaldatum': self.vervaldatum.isoformat() if self.vervaldatum else None,
                'status': self.status or 'onbekend',
                'beschrijving': self.beschrijving or ''
            }
        except Exception as e:
            print(f'Error in policy.to_dict: {str(e)}')
            raise

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
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Email en wachtwoord zijn verplicht'}), 400

    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            }
        }), 200
    
    return jsonify({'message': 'Ongeldige inloggegevens'}), 401

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user = get_jwt_identity()
        if isinstance(current_user, dict):
            user_id = current_user.get('user_id')
        else:
            user_id = current_user
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Gebruiker niet gevonden'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            }
        }), 200
    except Exception as e:
        print(f'Error in verify_token: {str(e)}')
        return jsonify({'message': 'Er is een fout opgetreden'}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user = get_jwt_identity()
        if isinstance(current_user, dict):
            user_id = current_user.get('user_id')
        else:
            user_id = current_user
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Gebruiker niet gevonden'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            }
        }), 200
    except Exception as e:
        print(f'Error in get_current_user: {str(e)}')
        return jsonify({'message': 'Er is een fout opgetreden'}), 500

# Protected route example
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'logged_in_as': current_user})

# API: afspraken ophalen en toevoegen
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/appointments/fake', methods=['POST'])
@jwt_required()
def add_fake_appointments():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    from datetime import datetime, timedelta
    admin = User.query.filter_by(role='admin').first()
    advisor = User.query.filter_by(role='adviseur').first()
    appts = [
        Appointment(
            user_id=admin.id,
            title='Kennismaking',
            description='Eerste kennismaking met klant',
            start=datetime.now() + timedelta(days=1, hours=9),
            end=datetime.now() + timedelta(days=1, hours=10)
        ),
        Appointment(
            user_id=admin.id,
            title='Polisbespreking',
            description='Bespreking autoverzekering',
            start=datetime.now() + timedelta(days=2, hours=14),
            end=datetime.now() + timedelta(days=2, hours=15)
        ),
        Appointment(
            user_id=advisor.id if advisor else admin.id,
            title='Adviesgesprek',
            description='Advies over woonverzekering',
            start=datetime.now() + timedelta(days=3, hours=11),
            end=datetime.now() + timedelta(days=3, hours=12)
        )
    ]
    db.session.add_all(appts)
    db.session.commit()
    return jsonify({'message': 'Fictieve afspraken toegevoegd.'}), 201

@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    if user.role == 'admin':
        appointments = Appointment.query.all()
    else:
        appointments = Appointment.query.filter_by(user_id=user.id).all()
    return jsonify([
        {
            'id': a.id,
            'user_id': a.user_id,
            'user_name': a.user.name,
            'title': a.title,
            'description': a.description,
            'start': a.start.isoformat(),
            'end': a.end.isoformat()
        } for a in appointments
    ])

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def add_appointment():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    new_appt = Appointment(
        user_id=user.id,
        title=data.get('title'),
        description=data.get('description'),
        start=datetime.fromisoformat(data.get('start')),
        end=datetime.fromisoformat(data.get('end'))
    )
    db.session.add(new_appt)
    db.session.commit()
    return jsonify({'message': 'Afspraak toegevoegd'}), 201

# Create tables
def init_db():
    with app.app_context():
        db.create_all()
        # Admin user
        admin = User.query.filter_by(email='admin@riskproactief.nl').first()
        if not admin:
            admin = User(
                email='admin@riskproactief.nl',
                name='Administrator',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

        # Adviseur user
        advisor = User.query.filter_by(email='adviseur@riskproactief.nl').first()
        if not advisor:
            advisor = User(
                email='adviseur@riskproactief.nl',
                name='Adviseur Demo',
                role='adviseur'
            )
            advisor.set_password('adviseur123')
            db.session.add(advisor)
            db.session.commit()

        # Fictieve afspraken
        from datetime import timedelta
        if not Appointment.query.first():
            appts = [
                Appointment(
                    user_id=admin.id,
                    title='Kennismaking',
                    description='Eerste kennismaking met klant',
                    start=datetime.now() + timedelta(days=1, hours=9),
                    end=datetime.now() + timedelta(days=1, hours=10)
                ),
                Appointment(
                    user_id=admin.id,
                    title='Polisbespreking',
                    description='Bespreking autoverzekering',
                    start=datetime.now() + timedelta(days=2, hours=14),
                    end=datetime.now() + timedelta(days=2, hours=15)
                ),
                Appointment(
                    user_id=advisor.id if advisor else admin.id,
                    title='Adviesgesprek',
                    description='Advies over woonverzekering',
                    start=datetime.now() + timedelta(days=3, hours=11),
                    end=datetime.now() + timedelta(days=3, hours=12)
                )
            ]
            db.session.add_all(appts)
            db.session.commit()

        # Policies voor admin
        if admin:
            sample_policies_admin = [
                dict(
                    user_id=admin.id,
                    type='Autoverzekering',
                    dekking='All-risk',
                    premie=89.50,
                    eigen_risico=350.00,
                    vervaldatum=datetime.now() + timedelta(days=365),
                    status='actief',
                    beschrijving='Volledige dekking voor uw auto inclusief diefstal, schade en pech onderweg.'
                ),
                dict(
                    user_id=admin.id,
                    type='Woonverzekering',
                    dekking='Opstal en Inboedel',
                    premie=45.75,
                    eigen_risico=250.00,
                    vervaldatum=datetime.now() + timedelta(days=365),
                    status='actief',
                    beschrijving='Complete dekking voor uw woning en bezittingen.'
                ),
                dict(
                    user_id=admin.id,
                    type='Aansprakelijkheidsverzekering',
                    dekking='Particulier',
                    premie=5.95,
                    eigen_risico=0.00,
                    vervaldatum=datetime.now() + timedelta(days=365),
                    status='actief',
                    beschrijving='Bescherming tegen schade aan anderen.'
                )
            ]
            for p in sample_policies_admin:
                exists = Policy.query.filter_by(
                    user_id=p['user_id'],
                    type=p['type'],
                    dekking=p['dekking'],
                    premie=p['premie'],
                    eigen_risico=p['eigen_risico'],
                    status=p['status'],
                    beschrijving=p['beschrijving']
                ).first()
                if not exists:
                    db.session.add(Policy(**p))
            db.session.commit()

        # Policies voor adviseur
        if advisor:
            sample_policies_advisor = [
                dict(
                    user_id=advisor.id,
                    type='Bedrijfsautoverzekering',
                    dekking='WA + Volledig Casco',
                    premie=120.00,
                    eigen_risico=500.00,
                    vervaldatum=datetime.now() + timedelta(days=365),
                    status='actief',
                    beschrijving='Volledige dekking voor bedrijfsauto inclusief schade en diefstal.'
                ),
                dict(
                    user_id=advisor.id,
                    type='Zakelijke Aansprakelijkheidsverzekering',
                    dekking='Zakelijk',
                    premie=25.00,
                    eigen_risico=250.00,
                    vervaldatum=datetime.now() + timedelta(days=365),
                    status='actief',
                    beschrijving='Bescherming tegen zakelijke aansprakelijkheid.'
                )
            ]
            for p in sample_policies_advisor:
                exists = Policy.query.filter_by(
                    user_id=p['user_id'],
                    type=p['type'],
                    dekking=p['dekking'],
                    premie=p['premie'],
                    eigen_risico=p['eigen_risico'],
                    status=p['status'],
                    beschrijving=p['beschrijving']
                ).first()
                if not exists:
                    db.session.add(Policy(**p))
            db.session.commit()

# Health check and root endpoints
@app.route('/')
@app.route('/health')
def health_check():
    response = jsonify({
        'status': 'healthy',
        'message': 'Insurance Advisor API is running',
        'timestamp': datetime.utcnow().isoformat()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# API Routes
@app.route('/api/policies', methods=['GET'])
@jwt_required()
def get_policies():
    try:
        # Get current user
        current_user = get_jwt_identity()
        print(f'Current user identity: {current_user}')

        # Extract user_id
        if isinstance(current_user, dict):
            user_id = current_user.get('user_id')
        else:
            user_id = current_user

        print(f'Fetching policies for user_id: {user_id}')

        # Get user to verify they exist
        user = User.query.get(user_id)
        if not user:
            print(f'User {user_id} not found')
            return jsonify({'message': 'Gebruiker niet gevonden'}), 404

        # Get policies for user
        policies = Policy.query.filter_by(user_id=user_id).all()
        print(f'Found {len(policies)} policies')

        # Convert policies to dict
        result = []
        for policy in policies:
            try:
                policy_dict = policy.to_dict()
                result.append(policy_dict)
                print(f'Converted policy {policy.id}: {policy_dict}')
            except Exception as e:
                print(f'Error converting policy {policy.id} to dict: {str(e)}')
                continue

        return jsonify(result), 200

    except Exception as e:
        print(f'Error in get_policies: {str(e)}')
        return jsonify({'message': 'Er is een fout opgetreden'}), 500

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
        # Bericht opslaan in de database
        contact_msg = ContactMessage(
            naam=data["naam"],
            email=data["email"],
            telefoon=data.get("telefoon", ""),
            onderwerp=data.get("onderwerp", ""),
            bericht=data["bericht"],
            voorkeur_contact=data.get("voorkeurContact", "")
        )
        db.session.add(contact_msg)
        db.session.commit()
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

# Admin-only endpoint om alle gebruikers op te halen
from flask_jwt_extended import get_jwt_identity

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'msg': 'Admin privileges required'}), 403
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'email': u.email,
        'name': u.name,
        'role': u.role
    } for u in users])

# Admin-only endpoint om alle contactberichten op te halen
@app.route('/api/contact', methods=['GET'])
@jwt_required()
def get_contact_messages():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([msg.to_dict() for msg in messages]), 200

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5002, debug=os.environ.get('FLASK_ENV') == 'development')
