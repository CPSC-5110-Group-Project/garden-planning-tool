# Garden Planning Tool

Application for planning and managing gardens.

## Project Structure
- `/backend`: FastAPI service (Python 3.14)
- `/frontend`: React + Vite
- `/docs`: Project documentation and architecture notes (In Progress)

### Prerequisites
- **Python 3.14.4+**
- **Node.js 25.9.0 & npm 11.12.1**: Required to run the Vite development server and manage React dependencies.
- **VS Code**: Recommended editor (see `.vscode/extensions.json` for suggested plugins).

### Backend Setup
1. `cd backend`
2. `source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `cp .env.example .env`
5. `fastapi dev main.py` (Runs on port 8000)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env.local`
4. `npm run dev` (Runs on port 5173)
