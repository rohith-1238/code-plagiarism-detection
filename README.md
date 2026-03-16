# CodeScan AI — Code Plagiarism Detection System
### Final Year Project | Python + Flask + React + Machine Learning

---

## System Architecture

```
Browser (React)
    │  HTTP/JSON
    ▼
Flask REST API  ──▶  ML Pipeline (Scikit-learn / NLTK)
    │                   ├─ CodePreprocessor
    │                   ├─ TF-IDF Vectorizer
    │                   └─ Cosine + Jaccard Similarity
    ▼
MySQL Database
```

---

## Project Structure

```
code_plagiarism_system/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js          # Public navigation bar
│   │   │   ├── Sidebar.js         # Authenticated sidebar
│   │   │   └── ScoreRing.js       # Circular score visualiser
│   │   ├── context/
│   │   │   └── AuthContext.js     # JWT auth state
│   │   ├── pages/
│   │   │   ├── HomePage.js        # Landing page
│   │   │   ├── SignupPage.js      # Registration
│   │   │   ├── LoginPage.js       # Authentication
│   │   │   ├── DashboardPage.js   # Overview dashboard
│   │   │   ├── UploadPage.js      # Drag-and-drop upload
│   │   │   ├── ResultsPage.js     # Analysis results + heatmap
│   │   │   └── HistoryPage.js     # Past analyses
│   │   ├── services/
│   │   │   └── api.js             # Axios API layer
│   │   ├── App.js                 # Router + protected routes
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Global design system
│   └── package.json
│
├── backend/
│   ├── app.py                     # Flask app factory + entry
│   ├── plagiarism_detector.py     # ML core: preprocess → TF-IDF → similarity
│   ├── models/
│   │   └── db.py                  # SQLAlchemy models (User, Analysis)
│   ├── routes/
│   │   ├── auth_routes.py         # POST /signup /login /logout /me
│   │   ├── upload_routes.py       # POST /upload
│   │   └── analysis_routes.py     # GET /analysis/:id  GET/DELETE /history
│   ├── requirements.txt
│   └── .env.example
│
└── database/
    └── schema.sql                 # MySQL DDL
```

---

## API Endpoints

| Method | Endpoint                      | Auth | Description                        |
|--------|-------------------------------|------|------------------------------------|
| POST   | /api/auth/signup              | No   | Register new user                  |
| POST   | /api/auth/login               | No   | Login, returns JWT                 |
| POST   | /api/auth/logout              | Yes  | Logout (clear cookie)              |
| GET    | /api/auth/me                  | Yes  | Get current user info              |
| POST   | /api/upload                   | Yes  | Upload files + run analysis        |
| GET    | /api/analysis/:id             | Yes  | Fetch a specific analysis result   |
| GET    | /api/history                  | Yes  | Get all analyses for current user  |
| DELETE | /api/history/:id              | Yes  | Delete an analysis record          |
| GET    | /api/health                   | No   | Health check                       |

---

## Machine Learning Workflow

```
1. Upload Code Files
        │
2. Preprocess Each File
   ├─ Remove comments (// # /* */ docstrings)
   ├─ Remove blank lines & collapse whitespace
   └─ Normalise identifiers → VAR_0, VAR_1, …

        │
3. Tokenize
   └─ Split into word + symbol tokens

        │
4. TF-IDF Vectorization  (unigrams + bigrams + trigrams)
   └─ sklearn TfidfVectorizer(ngram_range=(1,3), sublinear_tf=True)

        │
5. Cosine Similarity Matrix  (N × N)
   └─ sklearn cosine_similarity()

        │
6. Jaccard Similarity  (per pair)
   └─ |A ∩ B| / |A ∪ B|  on token sets

        │
7. Combined Score = 0.7 × Cosine + 0.3 × Jaccard

        │
8. Find Matching Segments  (common token subsequences ≥ 5 tokens)

        │
9. Return JSON: { pairs, overall_score, similarity_matrix }
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

---

### Step 1 — Clone / extract project

```bash
cd code_plagiarism_system
```

---

### Step 2 — Set up MySQL database

```sql
-- In MySQL client:
CREATE DATABASE plagiarism_db;
```

Then run the schema:
```bash
mysql -u root -p plagiarism_db < database/schema.sql
```

---

### Step 3 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit environment file
cp .env.example .env
# → Edit .env: set DB_USER, DB_PASSWORD, SECRET_KEY, JWT_SECRET_KEY

# Start the Flask server
python app.py
# → Runs on http://localhost:5000
```

The first run automatically:
- Downloads NLTK data (`punkt`, `stopwords`)
- Creates all database tables via SQLAlchemy

---

### Step 4 — Frontend setup

```bash
cd frontend

# Install Node packages
npm install

# Start React development server
npm start
# → Runs on http://localhost:3000
```

---

### Step 5 — Open the app

Navigate to **http://localhost:3000** in your browser.

1. Click **Get Started** → create an account
2. Go to **Upload Files**
3. Drag and drop 2+ code files (e.g. two Python `.py` files)
4. Select language → click **Analyze**
5. View the **Results** page: score ring, heatmap, matching segments

---

## Environment Variables (backend/.env)

```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=change-me-in-production
JWT_SECRET_KEY=change-me-in-production

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=plagiarism_db

UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216    # 16 MB

FRONTEND_URL=http://localhost:3000
```

---

## Supported File Types

`.py` `.java` `.js` `.ts` `.c` `.cpp` `.cs` `.rb` `.go` `.php` `.swift` `.kt` `.rs` `.txt`

---

## Features

- **JWT Authentication** — secure signup/login/logout
- **Drag-and-drop Upload** — supports 10+ languages
- **TF-IDF + Cosine Similarity** — industry-standard NLP technique
- **Jaccard Index** — token-set overlap for paraphrase detection
- **Code Normalisation** — catches rename-only plagiarism
- **Similarity Heatmap** — N×N colour grid across all file pairs
- **Radar Chart** — algorithm-by-algorithm visualisation
- **Matching Segments** — highlighted common code sequences
- **Analysis History** — persistent per-user history in MySQL
- **Download Report** — export full JSON result

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, React Router 6, Recharts  |
| Backend  | Python 3, Flask 3, Flask-JWT-Extended |
| ML/NLP   | Scikit-learn, NLTK, NumPy, Pandas   |
| Database | MySQL 8 + SQLAlchemy                |
| Auth     | JWT (HS256) + bcrypt                |
| Styling  | Custom CSS Design System            |

---

## Troubleshooting

**CORS errors** — Make sure `FRONTEND_URL` in `.env` matches your React dev server URL exactly.

**MySQL connection failed** — Verify `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env` and that MySQL is running.

**NLTK errors** — Run `python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"` manually.

**`npm start` fails** — Make sure Node 18+ is installed: `node --version`.
