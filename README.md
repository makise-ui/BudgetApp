# Budget Tracker

A modern, feature-rich budget tracking application built with React Native for Android.

## Features

- Track income and expenses with categorized transactions
- Set and monitor budgets for different categories
- Visualize spending patterns with charts and graphs
- Modern, intuitive user interface
- Data persistence using AsyncStorage
- Export functionality (planned)

## Screenshots

| Home Screen | Add Transaction | Budgets | Reports |
|-------------|-----------------|---------|---------|
| ![Home](screenshots/home.png) | ![Add Transaction](screenshots/add.png) | ![Budgets](screenshots/budgets.png) | ![Reports](screenshots/reports.png) |

## Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type safety and better development experience
- **React Navigation** - Navigation between screens
- **AsyncStorage** - Local data persistence
- **React Native Chart Kit** - Data visualization
- **React Native Vector Icons** - Iconography

## Advanced Features

- **Budget Tracking**: Set limits for spending categories and monitor progress
- **Financial Reports**: Visualize income vs expenses and spending by category
- **Data Management**: Persistent storage of all transactions and budgets
- **Category Management**: Customizable income and expense categories
- **Date Filtering**: Track transactions over different time periods

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development)

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

6. Run on iOS:
   ```bash
   npx react-native run-ios
   ```

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

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Material Icons](https://fonts.google.com/icons)
- Charts by [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)