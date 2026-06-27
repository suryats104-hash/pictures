# OralCollect

Companion app to **DHAANT** — collects patient intraoral photos into a local database for later annotation.

## Features
- Splash + Home screen styled like DHAANT (same Material 3 blue/teal theme).
- Patient registration: **name, age, sex, chief complaints**.
- Built-in camera with an **oral-cavity guide overlay** — captured image is auto-cropped to the framed region, so the face and background are excluded.
- Patient database (local AsyncStorage + image files in app storage).
- Search, view, share, delete photos and patient records.

## Setup

```bash
cd OralCollectApp
npm install
npx expo start
```

Open with Expo Go on your phone, or build native binaries with `eas build`.

## Build APK
```bash
npm i -g eas-cli
eas build -p android --profile preview
```

## How the crop works
The camera previews a centered oval guide (~82% × 34% of the screen). When you press the shutter,
the captured frame is cropped to that same fractional region using `expo-image-manipulator` before
being saved. No face data is persisted.

## Storage
- Patient records → AsyncStorage key `@oralcollect.patients.v1`.
- Photo files → `${FileSystem.documentDirectory}oralcollect/` (app-private, sandboxed).
