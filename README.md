# GymBuddy AI 🏋️‍♂️

A premium, glassmorphic AI personal trainer and workout tracker powered by Google's Gemini API. This application functions as a Progressive Web App (PWA), allowing it to be installed on mobile and desktop devices for a native app experience.

## Features

*   **AI Workout Generation**: Creates personalized weekly routines based on biometrics and goals.
*   **Interactive Dashboard**: Track daily exercises, sets, reps, and completion status.
*   **AI Chat Assistant**: Chat with "Aura", your personal trainer, to modify plans or ask for advice in real-time.
*   **Multi-Profile Support**: Manage multiple users within the same app.
*   **Video Tutorials**: One-click access to YouTube tutorials for every exercise.
*   **PWA Support**: Installable on iOS, Android, and Desktop. Works offline!

## How to Run

1.  **Environment Setup**:
    *   Ensure you have a modern web browser (Chrome, Safari, Edge).
    *   You need a **Google Gemini API Key**.

2.  **API Key Configuration**:
    *   The application expects the API key to be available in `process.env.API_KEY`.
    *   **Local Development**: You may need to configure your bundler (Vite, Webpack) or use a `.env` file if building locally.
    *   **Hosted**: If using a platform like AI Studio, the key is injected automatically.

3.  **Serving the App**:
    *   This is a static React application using ES modules.
    *   Serve the root directory using any static file server:
        *   `npx http-server .`
        *   `npx live-server .`
        *   VS Code "Live Server" extension.
    *   **Important**: Access the site via `localhost` or `HTTPS` to enable PWA features. Service Workers do not run on unsecure HTTP (except localhost).

## Mobile Installation (PWA)

**iOS (Safari):**
1.  Open the website in Safari.
2.  Tap the "Share" button (square with arrow up).
3.  Scroll down and tap "Add to Home Screen".

**Android (Chrome):**
1.  Open the website in Chrome.
2.  Tap the menu (three dots).
3.  Tap "Install App" or "Add to Home screen".

## Debugging Guide

### Common Issues

1.  **"API Key Missing"**:
    *   Check the browser console. If calls to Gemini fail, ensure `process.env.API_KEY` is correctly set.

2.  **App Not Installing**:
    *   Ensure you are serving over HTTPS or localhost.
    *   Refresh the page once to allow the Service Worker to register and cache assets.

3.  **Offline Mode Not Working**:
    *   The first load requires internet to cache the assets (Tailwind CSS, Icons, Fonts).
    *   Subsequent loads will work offline.

## Technologies

*   React 19
*   TypeScript
*   Tailwind CSS
*   Google Gemini API (`@google/genai`)
*   Lucide React (Icons)
*   Canvas Confetti
