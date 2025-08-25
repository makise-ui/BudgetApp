import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Transaction } from '../types';
import { getTransactions, deleteTransaction } from '../utils/dataManager';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [transactions]);

  const loadTransactions = async () => {
    const data = await getTransactions();
    // Sort by date descending
    const sortedData = data.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sortedData);
  };

  const calculateTotals = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });
    
    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(id);
            loadTransactions();
          }
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          <Icon 
            name={item.type === 'income' ? 'arrow-downward' : 'arrow-upward'} 
            size={24} 
            color={item.type === 'income' ? '#4CAF50' : '#F44336'} 
          />
        </View>
        <View>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)}>
          <Icon name="delete" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        <View style={styles.incomeExpenseContainer}>
          <View style={styles.incomeContainer}>
            <Text style={styles.incomeLabel}>Income</Text>
            <Text style={styles.incomeAmount}>${income.toFixed(2)}</Text>
          </View>
          <View style={styles.expenseContainer}>
            <Text style={styles.expenseLabel}>Expense</Text>
            <Text style={styles.expenseAmount}>${expense.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction' as never)}
      >
        <Icon name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.length > 0 ? (
          <FlatList
            data={transactions.slice(0, 5)}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noTransactionsContainer}>
            <Icon name="receipt" size={48} color="#BDBDBD" />
            <Text style={styles.noTransactionsText}>No transactions yet</Text>
            <Text style={styles.noTransactionsSubtext}>Add your first transaction</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  balanceCard: {
    backgroundColor: '#2196F3',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  incomeContainer: {
    alignItems: 'center',
  },
  incomeLabel: {
    color: '#E3F2FD',
    fontSize: 14,
  },
  incomeAmount: {
    color: '#E8F5E9',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseContainer: {
    alignItems: 'center',
  },
  expenseLabel: {
    color: '#E3F2FD',
    fontSize: 14,
  },
  expenseAmount: {
    color: '#FFEBEE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 32,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#757575',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  noTransactionsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noTransactionsText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 16,
  },
  noTransactionsSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
  },
});

export default HomeScreen;