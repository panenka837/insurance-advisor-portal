from app import app, db

def create_tables():
    with app.app_context():
        db.create_all()
        print("Database tabellen zijn aangemaakt")

if __name__ == '__main__':
    create_tables()
