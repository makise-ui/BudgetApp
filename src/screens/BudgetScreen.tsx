import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Budget } from '../types';
import { getBudgets } from '../utils/dataManager';

const BudgetScreen = () => {
  const navigation = useNavigation();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const percentage = (item.spent / item.limit) * 100;
    const isOverBudget = percentage > 100;
    
    return (
      <View style={styles.budgetItem}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetCategory}>{item.category}</Text>
          <Text style={styles.budgetAmount}>
            ${item.spent.toFixed(2)} / ${item.limit.toFixed(2)}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage > 100 ? 100 : percentage}%`,
                backgroundColor: isOverBudget ? '#F44336' : '#4CAF50',
              },
            ]}
          />
        </View>
        <Text style={[styles.budgetPercentage, isOverBudget && styles.overBudgetText]}>
          {percentage.toFixed(1)}% used
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgets</Text>
        <Text style={styles.headerSubtitle}>Manage your spending limits</Text>
      </View>

      {/* Add Budget Button */}
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={24} color="#2196F3" />
        <Text style={styles.addButtonText}>Add Budget</Text>
      </TouchableOpacity>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.budgetList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="account-balance-wallet" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No budgets yet</Text>
          <Text style={styles.emptySubtitle}>
            Create budgets to track your spending
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Budget</Text>
          </TouchableOpacity>
        </View>
      )}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  budgetList: {
    paddingHorizontal: 16,
  },
  budgetItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: 14,
    color: '#757575',
  },
  overBudgetText: {
    color: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BudgetScreen;