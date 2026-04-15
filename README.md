# Garden Planning Tool

Application for planning and managing gardens.

## Project Structure
- `/backend`: FastAPI service (Python 3.14)
- `/frontend`: (In Progress)
- `/docs`: Project documentation and architecture notes (In Progress)

## Backend Setup

### Prerequisites
- Python 3.14.4

### Installation
1. Navigate to the backend directory:
   `cd backend`
2. Create a virtual environment:
   `python -m venv venv`
3. Activate the environment:
   `source venv/bin/activate`
4. Install dependencies:
   `pip install -r requirements.txt`

### Running the Development Server
From the `/backend` directory:
`fastapi dev main.py`

The API will be available at `http://127.0.0.1:8000`. 
Check `http://127.0.0.1:8000/docs` for the interactive API documentation.
