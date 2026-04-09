# ModLab-Digital-Modulation-Simulator

A Digital Modulation Simulator for BASK, BFSK, and BPSK modulation schemes.

## Backend Setup

The backend is built with FastAPI.

### 1. Create and Activate Virtual Environment

**Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

Install the required packages using the generated `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 3. Run the Server

Start the FastAPI development server:

```bash
python main.py
```

The server will be running at `http://127.0.0.1:8000`. You can explore and test the endpoints interactively via the Swagger UI at `http://127.0.0.1:8000/docs`.