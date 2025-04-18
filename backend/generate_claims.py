import random
from faker import Faker
from app import db, app, User, Policy, Claim

fake = Faker('nl_NL')

claim_statuses = ['pending', 'approved', 'rejected']

beschrijvingen = [
    'Stormschade aan dak',
    'Waterschade door lekkage',
    'Diefstal van fiets',
    'Brandschade in keuken',
    'Ruitschade aan auto',
    'Schade door vandalisme',
    'Overstroming in kelder',
    'Verloren bagage op reis'
]

def create_claims(min_claims=2, max_claims=4):
    with app.app_context():
        users = User.query.filter(User.role != 'admin').all()
        for user in users:
            user_policies = Policy.query.filter_by(user_id=user.id).all()
            if not user_policies:
                continue
            num_claims = random.randint(min_claims, max_claims)
            for _ in range(num_claims):
                policy = random.choice(user_policies)
                claim = Claim(
                    policy_id=policy.id,
                    user_id=user.id,
                    status=random.choice(claim_statuses),
                    document_url=fake.file_path(extension='pdf') if random.random() > 0.3 else None,
                )
                db.session.add(claim)
        db.session.commit()
        print(f"Claims aangemaakt voor {len(users)} gebruikers.")

if __name__ == '__main__':
    create_claims()
