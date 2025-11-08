# 🗳️ PollHuB – Full Stack Polling Web Application

PollHuB is a full-stack polling application that allows admins to create and manage polls and **users** to vote securely and view results.  
It demonstrates full CRUD operations, role-based access control, authentication, and a clean RESTful API design.

---

## 🚀 Features

### 👩‍💼 Admin
- Create, edit, and delete polls.
- Add multiple options (minimum 2) per poll.
- Set closing date/time for polls.
- Manually close polls.
- View vote statistics and results after closing.

### 👩‍💻 User
- Register and log in securely.
- View list of open polls.
- Vote **only once** per poll.
- View poll results (bar chart) **only after poll closes**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | HTML, CSS, JavaScript (React via CDN) |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT (JSON Web Tokens) |
| Charts | Simple static bar chart rendering |
| Hosting-ready | Portable with Express REST APIs |

---

## 🧩 Folder Structure

```

PollHuB/
│
├── poll-frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── poll-backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── package.json
│   ├── .env.example
│   └── ...
│
├── setup.sh
├── README.md
└── .gitignore

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/shivanisingh1804/PollHuB.git
cd PollHuB
````

### 2️⃣ Backend Setup

```bash
cd poll-backend
npm install
```

Create a `.env` file in `poll-backend/`:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pollApp
JWT_SECRET=supersecretkey
```

Run backend:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd ../poll-frontend
npx serve .
```

The frontend will run on `http://localhost:3000`
Backend runs on `http://localhost:5000`

---

## 🔗 API Endpoints

### Auth Routes

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | User/Admin login  |

### Poll Routes (Admin)

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | `/api/polls`     | Create a new poll            |
| PUT    | `/api/polls/:id` | Update existing poll         |
| DELETE | `/api/polls/:id` | Delete poll                  |
| GET    | `/api/polls`     | View all polls (open/closed) |

### User Routes

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| GET    | `/api/polls/open`        | Get all open polls |
| POST   | `/api/polls/:id/vote`    | Vote on a poll     |
| GET    | `/api/polls/:id/results` | View poll results  |

---

## 🧠 Highlights

* Follows **MVC architecture** for backend.
* Secure routes with **JWT-based auth**.
* **Role-based** access control for Admin/User.
* Clean API structure with validation.
* Responsive and minimal frontend UI.
* LocalStorage used for demo persistence (frontend-only version).

---

## 🧰 Useful Commands

```bash
# Run backend (with nodemon)
npm run dev

# Run frontend
npx serve poll-frontend

# Kill background process on port 5000 (if needed)
npx kill-port 5000
```

---

## 🛡️ Security & Git Ignore

Your `.env` file should never be pushed to GitHub.

Make sure `.gitignore` contains:

```
node_modules/
.env
poll-backend/.env
poll-frontend/.env
```

---
## 🧑‍💻 Author

**Shivani Singh**
🎓 B.Tech CSE (AI Specialization)
🔗 [GitHub Profile](https://github.com/shivanisingh1804)

---

Would you like me to add **GitHub-style badges** (like “Made with Node.js”, “MongoDB”, “Frontend React”) at the top of this README for a more professional look?
```
