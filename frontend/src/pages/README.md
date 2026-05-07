# 📚 PustakHub - A Complete System for Book Lovers

PustakHub is a full-stack web application for buying and selling used books in Nepal. It connects book sellers and buyers directly, eliminating any middleman.

---

## 🚀 Tech Stack

- **Frontend:** React.js, Material UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **ML Service:** Python, Flask
- **Real-time Chat:** Socket.IO
- **Image Storage:** Cloudinary
- **Payment:** eSewa, Khalti (Sandbox)

---

## 🧠 Algorithms Used

1. **Levenshtein Distance** — Smart search with typo tolerance
2. **Collaborative Filtering (Cosine Similarity)** — Genre based book recommendations
3. **Linear Regression** — AI price suggestion based on condition and age

---

## ⚙️ How to Run the Project

### Prerequisites
Make sure you have these installed:
- Node.js (v18 or above)
- Python (v3.x)
- MongoDB (running locally)
- Git

---

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YourUsername/PustakHub.git
cd PustakHub
```

### Step 2 — Setup Backend
```bash
cd backend
npm install
node index.js
```
Backend runs on: **http://localhost:5000**

### Step 3 — Setup Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
```
Frontend runs on: **http://localhost:3000**

### Step 4 — Setup ML Service
Open another new terminal:
```bash
cd ml-service
python -m pip install flask scikit-learn pandas numpy flask-cors
python app.py
```
ML Service runs on: **http://localhost:5001**

---

## 🔑 Admin Access

Email: admin@pustakhub.com
Password: admin123
Go to: **http://localhost:3000/admin**

---

## ✨ Features

- 📖 Buy and sell used books
- 🔍 Smart search with typo tolerance
- 🤖 AI price suggestion
- 📚 Genre based book recommendations
- 💬 Real time buyer seller chat
- 🛒 Cart and Wishlist
- 💳 eSewa, Khalti and Bank payment
- 🖼️ Image upload with Cloudinary
- 👤 User authentication with JWT
- 🔧 Admin dashboard

---

## 📁 Project Structure
PustakHub/
├── backend/          ← Node.js + Express API
│   ├── models/       ← MongoDB schemas
│   ├── routes/       ← API routes
│   ├── middleware/   ← JWT authentication
│   └── index.js      ← Main server file
├── frontend/         ← React.js UI
│   └── src/
│       └── pages/    ← All page components
└── ml-service/       ← Python Flask ML algorithms
└── app.py        ← Levenshtein, Collaborative Filtering, Price Suggestion

---

## 👨‍💻 Developed By

**Sardip Parajuli , Aayush Pokharel , Rahul Neupane**
7th Semester Computer Science
Nepal