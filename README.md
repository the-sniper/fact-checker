
# Fact Checker - Frontend

A Next.js application for fact-checking statements and claims.

Overview
--------
This frontend application provides an intuitive interface for users to submit statements for fact-checking, and view results. Built with Next.js, it offers fast performance, server-side rendering, and a responsive design.

Getting Started
---------------
Prerequisites:
- Node.js 16.x or later
- npm or yarn package manager

Installation:

1. Clone the repository:
```
git clone https://github.com/the-sniper/fact-checker.git
cd fact-checker/frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open the application: `http://localhost:3000` in your browser to see the application.



# Fact Checker - Backend

The API and machine learning backend for the Fact Checker application.

Getting Started
---------------
Prerequisites:
- Python 3.8+ or Node.js 14+ (depending on your backend)
- pip or npm package manager
- Virtual environment tool (recommended, e.g., venv, conda)

Installation:

1. Navigate to the backend directory:
```
cd fact-checker/backend
```

2. Set up a virtual environment (Python backend):

 On Linux/Mac:
```
python -m venv venv
source venv/bin/activate
```

On Windows:
```
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Create a .env file with the following variables:
    - `OPENAI_API_KEY=<<YOUR_OPENAI_API_KEY>>`
    - `SERPER_API_KEY=<<YOUR_SERPER_API_KEY>>`
    - `SCRAPER_API_KEY=<<YOUR_SCRAPER_API_KEY>>`

5. Start the development server:
```
python -m app.app --port 8000
```

### Working Video -
`https://www.loom.com/share/391e17637fcb4e4b834ec11532c08b0d?sid=59cdb1bd-33ba-4c32-a2c8-aa6db2b048e8`