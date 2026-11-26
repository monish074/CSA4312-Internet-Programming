# LearnSphere – E-Learning Course & Online Quiz Portal

## Run
1. Extract the ZIP.
2. Open `index.html` in Chrome, Edge or Firefox (VS Code Live Server is recommended).
3. Register an account or use the demo accounts below.

## Demo accounts
- Faculty: `faculty@demo.com` / `faculty123`
- Student: `student@demo.com` / `student123`

## Features
**Student:** registration/login, course catalogue and enrolment, unit-wise material links, timed quizzes, auto-submit on timeout, instant scoring and correct-answer review, quiz history, progress dashboard and profile.

**Faculty:** course create/update/delete, add PDF/resource URLs and video links by unit, quiz builder with four options and correct answer, configurable time limit, course-wise student reports and CSV export.

## Storage / demonstration notes
This is a front-end prototype. Users, courses, materials metadata, enrolments, quizzes and results are stored in browser `localStorage`; they are not synchronised across devices. Use the same browser to retain data. The PDF/video material feature accepts hosted shareable URLs; it does not upload files to a server. Passwords are stored locally for demonstration only and this is not production-grade authentication. No institutional backend, email/SMS notifications or server database is connected.

To reset demo data, remove the `learnsphere_v2` item from browser Local Storage and refresh.
