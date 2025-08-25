# Budget Tracker App - Development Context

## Project Overview

This is a React Native mobile application for budget tracking on Android. The app allows users to:

- Track income and expenses with categorized transactions
- Set and monitor budgets for different categories
- Visualize spending patterns with charts and graphs
- Manage data locally using AsyncStorage

Key technologies used:
- React Native with TypeScript
- React Navigation (bottom tabs and stack)
- AsyncStorage for local data persistence
- React Native Chart Kit for data visualization
- React Native Vector Icons for UI icons

## Project Structure

- `App.tsx`: Main application component with navigation setup
- `src/screens/`: Contains screen components (Home, AddTransaction, Budget, Reports, Settings)
- `src/types/`: TypeScript type definitions (Transaction, Budget, Category)
- `src/utils/dataManager.ts`: Handles all data operations with AsyncStorage

## Building and Running

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Android Studio (for Android development)

### Key Commands
- Install dependencies: `npm install`
- Start Metro bundler: `npx react-native start`
- Run on Android: `npx react-native run-android`
- Run tests: `npm test`
- Lint code: `npm run lint`

### Manual APK Generation
1. Navigate to the android directory: `cd android`
2. Run the gradle command: `./gradlew assembleRelease`
   - APK location: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Development Conventions

- TypeScript is used for type safety throughout the project
- Functional components with React hooks are the standard
- Data management is centralized in `src/utils/dataManager.ts`
- UI components use React Native's StyleSheet for styling
- Navigation is handled by React Navigation with a bottom tab navigator and stack navigator
- Icons are from React Native Vector Icons (MaterialIcons set)

## Data Model

- **Transaction**: id, amount, description, category, date, type (income/expense)
- **Budget**: id, name, limit, spent, category
- **Category**: id, name, icon, color, type (income/expense)

## GitHub Workflow

- Automatic APK generation on push to `main` branch
- APK uploaded as artifact and attached to new release
- Release tags automatically generated (v1, v2, etc.)

## Testing

Jest is configured for testing. Run tests with `npm test`.