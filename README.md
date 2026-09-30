# ClassFinder

An Android-first mobile app (built with Expo / React Native, so iOS can follow later) for finding local
classes — music, tuition, art, dance, sports, languages, coding and more.

## Features

- **Accounts** – sign up / log in with email & password (Firebase Auth). Sessions persist across restarts.
- **Search** – find classes by area or city, filter by category and keyword.
- **Listings** – any user can publish a class with description, location, pricing, timings, contact
  details (phone, email, website) and any number of custom fields ("Age group", "Batch size", …).
  Owners can edit or delete their listings from the *My listings* tab.
- **Contact** – one-tap Call, WhatsApp, Email and Website buttons on each listing.
- **Reviews** – 1–5 star rating plus comment; one review per user per listing (editable), and owners
  can't review their own classes. Average rating and count are shown on every listing.

## Project layout

```
src/app/                 Expo Router screens
  (auth)/login, register Sign-in flow (shown when logged out)
  (tabs)/index           Search
  (tabs)/my-listings     The user's own listings + "Create a listing"
  (tabs)/profile         Account / log out
  listing/[id]           Listing details, contact buttons, reviews
  listing/new            Create listing
  listing/edit/[id]      Edit listing
src/components/          Shared UI (form, cards, star rating…)
src/lib/                 Firebase setup, auth context, Firestore data access
firestore.rules          Database security rules
```

## Setup

1. **Install dependencies**: `npm install`
2. **Create a Firebase project** at <https://console.firebase.google.com>:
   - *Build → Authentication → Sign-in method*: enable **Email/Password**.
   - *Build → Firestore Database*: create a database.
   - *Project settings → Your apps*: add a **Web app** and copy its config.
3. `cp .env.example .env` and paste the config values into `.env`.
4. **Deploy the security rules**: `npx firebase-tools deploy --only firestore:rules`
   (or paste `firestore.rules` into the console's Rules tab).

## Run on Android

- **Quickest:** `npm start`, then scan the QR code with the **Expo Go** app on your Android phone.
- **Emulator:** start an Android emulator, then `npm run android`.

## Build an installable Android app

Uses [EAS Build](https://docs.expo.dev/build/introduction/) (cloud build, no Android Studio needed):

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview      # .apk to install/share directly
npx eas-cli@latest build -p android --profile production   # .aab for the Google Play Store
```

Add the `EXPO_PUBLIC_FIREBASE_*` values as EAS environment variables (or keep `.env` present when building)
so they are baked into the build. The Android package id is `com.classfinder.app` (change it in
`app.json` before your first Play Store upload — it can't be changed afterwards).

## Checks

```bash
npm run typecheck
```

## Known limitations / next steps

- Search matches area/city words exactly (e.g. "Koramangala"); there's no GPS "near me" or fuzzy search
  yet. For large scale, add geohash queries or a search service such as Algolia / Typesense.
- Rating totals are updated from the app inside a transaction; security rules restrict the change to one
  review's worth, but a Cloud Function would make aggregation fully server-authoritative.
- Deleting a listing doesn't delete its reviews sub-collection (they become unreachable).
- No photo uploads yet (Firebase Storage + `expo-image-picker` would be the natural addition).
