# Insurance Advisor Portal

A web application for managing insurance policies and claims with role-based access control.

## Features

- User authentication with role-based access control (Admin/User)
- Insurance policy management
- Claims handling
- Statistics dashboard (Admin only)
- Contact form
- Responsive design

## Tech Stack

### Frontend
- React with Vite
- Material-UI
- React Router DOM
- Axios for API calls
- JWT authentication

### Backend
- Flask
- SQLite database
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Mail
- Flask-CORS

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/insurance-advisor-portal.git
cd insurance-advisor-portal
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5002

### Default Users

1. Admin Account:
   - Email: admin@riskproactief.nl
   - Password: admin123

2. Regular User Account:
   - Email: user@riskproactief.nl
   - Password: user123

## Deployment

### Frontend
- Deployed on Netlify
- Production URL: https://insurance-advisor-portal.windsurf.build

### Backend
- Ready for deployment on Render.com
- Uses Gunicorn as production server

## License

MIT License - See LICENSE file for details
