# Recipe Genie — Experiment 14

A mobile-first recipe discovery mini project built with Expo, React Native, Expo Router, Firebase, and React Native Paper.

## Screens

| Screen | Route | What it does |
| --- | --- | --- |
| Splash | `/` | Shows the app icon while checking the signed-in user. |
| Login | `/login` | Signs in with Firebase Authentication. |
| Registration | `/register` | Creates an account and stores its profile in Firestore. |
| Home | `/home` | Loads popular recipes from TheMealDB. |
| Discover | `/search` | Searches TheMealDB for recipes by name. |
| Recipe details | `/details?id=...` | Shows recipe ingredients and instructions. |
| Saved recipes | `/favorites` | Lists and removes the signed-in user's Firestore favorites. |
| Profile | `/profile` | Displays the account and signs out. |

## Experiment requirements covered

- **Authentication:** Firebase email/password login and registration.
- **Firestore:** account profiles in `users/{uid}` and saved recipes in `users/{uid}/favorites/{recipeId}`.
- **Navigation:** file-based routes with Expo Router and a shared bottom navigation bar.
- **UI library:** React Native Paper components and theme.
- **External API:** TheMealDB search and recipe lookup endpoints.
- **Splash and app icon:** Expo native splash configuration plus an app-icon loading screen.

## Run the app

```bash
npm install
npx expo start
```

## Firebase setup

The Firebase client configuration is in `src/firebase/firebaseConfig.ts`. Use the Firebase project configuration provided for your class project. In Firebase Console, enable **Authentication → Email/Password** and create a **Cloud Firestore** database. The app saves each user's profile and favorite recipes under that user's UID.

Example Firestore rules for this data shape:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /favorites/{recipeId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```
