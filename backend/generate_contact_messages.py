import random
from faker import Faker
from app import db, app, ContactMessage

fake = Faker('nl_NL')

onderwerpen = [
    'Vraag over polis',
    'Wijziging doorgeven',
    'Nieuwe verzekering',
    'Schade melden',
    'Factuur ontvangen',
    'Afspraak maken',
    'Overige vraag'
]

voorkeuren = ['email', 'telefoon']

def create_messages(n=10):
    with app.app_context():
        for _ in range(n):
            msg = ContactMessage(
                naam=fake.name(),
                email=fake.email(),
                telefoon=fake.phone_number(),
                onderwerp=random.choice(onderwerpen),
                bericht=fake.paragraph(nb_sentences=4),
                voorkeur_contact=random.choice(voorkeuren)
            )
            db.session.add(msg)
        db.session.commit()
        print(f"{n} contactberichten toegevoegd.")

if __name__ == '__main__':
    create_messages(12)
