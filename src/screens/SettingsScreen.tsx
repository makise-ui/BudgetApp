import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const settingsOptions = [
    {
      title: 'Account',
      icon: 'account-circle',
      options: ['Profile', 'Security', 'Notifications'],
    },
    {
      title: 'Preferences',
      icon: 'settings',
      options: ['Currency', 'Language', 'Theme'],
    },
    {
      title: 'Data',
      icon: 'data-usage',
      options: ['Backup', 'Export', 'Import'],
    },
    {
      title: 'Support',
      icon: 'help',
      options: ['Help Center', 'Contact Us', 'About'],
    },
  ];

  const renderSettingItem = (item: { title: string; icon: string; options: string[] }) => (
    <View key={item.title} style={styles.settingSection}>
      <View style={styles.settingHeader}>
        <Icon name={item.icon} size={24} color="#2196F3" />
        <Text style={styles.settingTitle}>{item.title}</Text>
      </View>
      {item.options.map((option, index) => (
        <TouchableOpacity key={index} style={styles.settingOption}>
          <Text style={styles.settingOptionText}>{option}</Text>
          <Icon name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </View>

      {/* Settings List */}
      <View style={styles.settingsContainer}>
        {settingsOptions.map(renderSettingItem)}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Icon name="logout" size={24} color="#F44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 12,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingOptionText: {
    fontSize: 16,
    color: '#212121',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F44336',
    marginLeft: 12,
  },
});

export default SettingsScreen;