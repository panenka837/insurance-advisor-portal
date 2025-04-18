from app import db, User
from werkzeug.security import generate_password_hash

def add_demo_user():
    email = 'demo@klant.nl'
    name = 'Jan Demo'
    role = 'client'
    password = 'demo123'

    # Check of de gebruiker al bestaat
    existing = User.query.filter_by(email=email).first()
    if existing:
        print(f"Gebruiker met email {email} bestaat al.")
        return

    user = User(
        email=email,
        name=name,
        role=role
    )
    user.set_password(password)  # Zorg dat User een set_password methode heeft
    db.session.add(user)
    db.session.commit()
    print(f"Demo gebruiker '{name}' ({email}) aangemaakt met wachtwoord: {password}")

from app import app

if __name__ == '__main__':
    with app.app_context():
        add_demo_user()
