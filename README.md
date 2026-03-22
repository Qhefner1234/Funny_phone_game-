# Funny Phone Game 👑

A hilarious strategy game for iPhone and Android built with React Native.

## Concept

You are a newly crowned ruler of a questionable kingdom. Over 5 rounds, you'll face absurd scenarios — time-traveling goats, invisible armies, singing swamps — and must make strategic decisions that affect your kingdom's:

- 💰 **Gold** — your treasury
- ⚔️ **Army** — your military strength
- 😄 **Happiness** — citizen morale
- ⭐ **Reputation** — how other kingdoms see you

At the end, receive a rating from *Legendary Disaster* to *Supreme Overlord*.

## Tech Stack

- **React Native 0.73** — cross-platform (iOS + Android)
- **React Navigation 6** — screen navigation
- No backend required — fully offline

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Install

```bash
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.js     # Title screen
│   ├── GameScreen.js     # Main gameplay
│   └── ResultsScreen.js  # End-game rating
├── components/
│   └── StatBar.js        # Reusable stat progress bar
├── data/
│   └── scenarios.js      # 8 funny scenarios (5 chosen randomly per game)
└── utils/
    └── gameLogic.js      # Score, effects, ratings
```
