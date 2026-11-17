TECHVISTA 2026 – WEBSITE PROJECT

CONTENTS
- index.html       Home page
- schedule.html    Three-hall schedule (Day 1)
- register.html    HTML5 registration form
- media.html       Video, audio and Build My Agenda
- style.css        Shared responsive CSS and dark mode
- app.js           Shared JavaScript
- manifest.json    PWA manifest
- sw.js             Offline service worker
- captions.vtt     English captions sample
- images/          Banner, sponsor, poster and PWA icons
- media/           Add your own video and podcast files here

HOW TO RUN
Recommended:
1. Extract the ZIP.
2. Open the TechVista2026 folder in Visual Studio Code.
3. Install/use the Live Server extension.
4. Right-click index.html and choose "Open with Live Server".
5. Navigate using the top menu.

Alternative:
- Open a terminal inside the extracted TechVista2026 folder.
- Run: python -m http.server 8000
- Open http://localhost:8000 in your browser.

IMPORTANT
- Do not double-click the HTML files if you want to test the PWA/service worker.
  Service workers require HTTPS or localhost.
- The demo registration form validates in the browser but does not store or send
  registrations. A secure backend/API is required for real registration.
- Add your actual media files:
    media/promo.mp4
    media/promo.webm
    media/podcast.mp3
    media/podcast.ogg
  The media page displays a fallback until those files are added.
- Replace the sample sponsor logos and banner with official assets if required.
- The schedule currently demonstrates the Day 1 schedule requested in the brief.
- Before publishing, configure HTTPS and server-side security headers, including
  Content-Security-Policy and Strict-Transport-Security (HSTS).
- Check all HTML and CSS with the W3C validators and take your own DevTools
  screenshots for the assignment report.

This is a front-end educational project built with HTML5, CSS3 and plain JavaScript.
