# Polls App - Frontend (Standalone)

This is a static frontend demo for the Polls web application. It uses **React via CDN** and **browser localStorage** as a mock backend so you can run it without installing dependencies.

Features:
- Signup & Login (roles: user/admin)
- Admin can create, edit, delete polls; set closing datetime; manually close/reopen polls
- Users can view open polls and vote once per poll
- After voting and when poll is closed, users can view final results as static bar-chart visuals
- Validation: at least two options, no duplicate options, non-empty fields
- Responsive layout

How to run:
1. Unzip the files and open `index.html` in a browser.
2. Seed admin credentials: `admin@poll.app` / `admin123`
3. Data is persistent in your browser's localStorage.

Files:
- index.html — main page (loads React from CDN)
- app.js — application code (React components)
- styles.css — styling
- README.md — this file

Note: This is a frontend-only demo. For production or multi-user use, connect to a backend API and a database.
