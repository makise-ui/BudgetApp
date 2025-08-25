import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Budget, Category } from '../types';

const TRANSACTIONS_KEY = 'transactions';
const BUDGETS_KEY = 'budgets';
const CATEGORIES_KEY = 'categories';

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Salary', icon: 'work', color: '#4CAF50', type: 'income' },
  { id: '2', name: 'Freelance', icon: 'laptop', color: '#8BC34A', type: 'income' },
  { id: '3', name: 'Investment', icon: 'trending-up', color: '#CDDC39', type: 'income' },
  { id: '4', name: 'Food', icon: 'restaurant', color: '#F44336', type: 'expense' },
  { id: '5', name: 'Transport', icon: 'directions-car', color: '#E91E63', type: 'expense' },
  { id: '6', name: 'Shopping', icon: 'shopping-cart', color: '#9C27B0', type: 'expense' },
  { id: '7', name: 'Entertainment', icon: 'local-movies', color: '#3F51B5', type: 'expense' },
  { id: '8', name: 'Utilities', icon: 'flash-on', color: '#2196F3', type: 'expense' },
  { id: '9', name: 'Health', icon: 'local-hospital', color: '#03A9F4', type: 'expense' },
  { id: '10', name: 'Education', icon: 'school', color: '#00BCD4', type: 'expense' },
];

// Transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const transactions = await getTransactions();
    transactions.push(transaction);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error deleting transaction:', error);
  }
};

// Budgets
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const budgets = await AsyncStorage.getItem(BUDGETS_KEY);
    return budgets ? JSON.parse(budgets) : [];
  } catch (error) {
    console.error('Error getting budgets:', error);
    return [];
  }
};

export const saveBudget = async (budget: Budget): Promise<void> => {
  try {
    const budgets = await getBudgets();
    budgets.push(budget);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budget:', error);
  }
};

export const updateBudget = async (id: string, updatedBudget: Budget): Promise<void> => {
  try {
    const budgets = await getBudgets();
    const index = budgets.findIndex(budget => budget.id === id);
    if (index !== -1) {
      budgets[index] = updatedBudget;
      await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categories = await AsyncStorage.getItem(CATEGORIES_KEY);
    return categories ? JSON.parse(categories) : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error getting categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategory = async (category: Category): Promise<void> => {
  try {
    const categories = await getCategories();
    categories.push(category);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

// Initialize with default data
export const initializeAppData = async (): Promise<void> => {
  try {
    const categories = await getCategories();
    if (categories.length === 0) {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
};