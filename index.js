/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { initializeAppData } from './src/utils/dataManager';

// Initialize app data
initializeAppData().then(() => {
  AppRegistry.registerComponent(appName, () => App);
});