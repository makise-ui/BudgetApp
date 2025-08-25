# Budget Tracker

A modern, feature-rich budget tracking application built with React Native for Android.

## Features

- Track income and expenses with categorized transactions
- Set and monitor budgets for different categories
- Visualize spending patterns with charts and graphs
- Modern, intuitive user interface
- Data persistence using AsyncStorage

## Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type safety and better development experience
- **React Navigation** - Navigation between screens
- **AsyncStorage** - Local data persistence
- **React Native Chart Kit** - Data visualization
- **React Native Vector Icons** - Iconography

## Project Structure

```
BudgetTracker/
├── src/
│   ├── screens/          # Screen components
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions (data management)
├── App.tsx               # Main application component
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Data Model

- **Transaction**: id, amount, description, category, date, type (income/expense)
- **Budget**: id, name, limit, spent, category
- **Category**: id, name, icon, color, type (income/expense)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/budget-tracker.git
   ```

2. Navigate to the project directory:
   ```bash
   cd budget-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the Metro bundler:
   ```bash
   npx react-native start
   ```

5. Run on Android:
   ```bash
   npx react-native run-android
   ```

## Key Commands

- Install dependencies: `npm install`
- Start Metro bundler: `npx react-native start`
- Run on Android: `npx react-native run-android`
- Run tests: `npm test`
- Lint code: `npm run lint`

## GitHub Workflow

This project includes a GitHub Actions workflow for automatically building APK files:

- On every push to the `main` branch, a new APK is generated
- The APK is uploaded as an artifact and attached to a new release
- Release tags are automatically generated (v1, v2, etc.)

## Building APK

To generate a release APK manually:

1. Navigate to the android directory:
   ```bash
   cd android
   ```

2. Run the gradle command:
   ```bash
   ./gradlew assembleRelease
   ```

The APK will be generated at `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Development Conventions

- TypeScript is used for type safety throughout the project
- Functional components with React hooks are the standard
- Data management is centralized in `src/utils/dataManager.ts`
- UI components use React Native's StyleSheet for styling
- Navigation is handled by React Navigation with a bottom tab navigator and stack navigator
- Icons are from React Native Vector Icons (MaterialIcons set)

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Material Icons](https://fonts.google.com/icons)
- Charts by [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)