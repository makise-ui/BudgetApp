import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Transaction } from '../types';
import { getTransactions } from '../utils/dataManager';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await getTransactions();
    setTransactions(data);
  };

  // Calculate expense data for pie chart
  const getExpenseData = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals: { [key: string]: number } = {};
    
    expenseTransactions.forEach(transaction => {
      if (categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] += transaction.amount;
      } else {
        categoryTotals[transaction.category] = transaction.amount;
      }
    });
    
    return Object.keys(categoryTotals).map((category, index) => ({
      name: category,
      amount: categoryTotals[category],
      color: `hsl(${index * 60}, 70%, 50%)`,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  // Calculate income vs expense data
  const getIncomeExpenseData = () => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
      }
    });
    
    return {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        colors: [
          (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        ]
      }]
    };
  };

  const expenseData = getExpenseData();
  const incomeExpenseData = getIncomeExpenseData();

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>Analyze your financial habits</Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {['week', 'month', 'year'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.selectedTimeRangeButton,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.selectedTimeRangeText,
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Income vs Expense Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Income vs Expense</Text>
        <BarChart
          data={incomeExpenseData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel="$"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Expense by Category Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Expenses by Category</Text>
        {expenseData.length > 0 ? (
          <PieChart
            data={expenseData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No expense data available</Text>
          </View>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>
            ${incomeExpenseData.datasets[0].data[0].toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={styles.summaryValue}>
            ${incomeExpenseData.datasets[0].data[1].toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, styles.netCard]}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={styles.netValue}>
            ${(incomeExpenseData.datasets[0].data[0] - incomeExpenseData.datasets[0].data[1]).toFixed(2)}
          </Text>
        </View>
      </View>
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
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeRangeButton: {
    backgroundColor: '#2196F3',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  selectedTimeRangeText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#757575',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  netCard: {
    backgroundColor: '#E3F2FD',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
  },
  netValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 8,
  },
});

export default ReportsScreen;