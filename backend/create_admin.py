from app import app, db, User
from werkzeug.security import generate_password_hash

def create_admin_user():
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@insurance.com').first()
        if not admin:
            admin = User(
                naam='Admin',
                email='admin@insurance.com',
                wachtwoord=generate_password_hash('admin123'),
                rol='admin'
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin gebruiker aangemaakt")
        else:
            print("Admin gebruiker bestaat al")

if __name__ == '__main__':
    create_admin_user()
