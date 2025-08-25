import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Transaction, Category } from '../types';
import { saveTransaction, getCategories } from '../utils/dataManager';

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data.filter(cat => cat.type === 'expense'));
    setSelectedCategory(data.find(cat => cat.type === 'expense') || null);
  };

  const handleSaveTransaction = async () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description,
      category: selectedCategory.name,
      date,
      type: selectedType,
    };

    try {
      await saveTransaction(transaction);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const toggleType = (type: 'income' | 'expense') => {
    setSelectedType(type);
    const filteredCategories = categories.filter(cat => cat.type === type);
    setCategories(filteredCategories);
    setSelectedCategory(filteredCategories[0] || null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Transaction Type Selector */}
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'income' && styles.selectedIncomeButton,
          ]}
          onPress={() => toggleType('income')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === 'income' && styles.selectedIncomeText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'expense' && styles.selectedExpenseButton,
          ]}
          onPress={() => toggleType('expense')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === 'expense' && styles.selectedExpenseText,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#9E9E9E"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Description Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description"
          placeholderTextColor="#9E9E9E"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Date Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Icon name="calendar-today" size={20} color="#757575" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      {/* Category Selector */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory?.id === category.id && styles.selectedCategory,
                { borderColor: category.color },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Icon
                name={category.icon}
                size={20}
                color={selectedCategory?.id === category.id ? '#FFFFFF' : category.color}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory?.id === category.id && styles.selectedCategoryText,
                  { color: selectedCategory?.id === category.id ? '#FFFFFF' : category.color },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
        <Text style={styles.saveButtonText}>Save Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedIncomeButton: {
    backgroundColor: '#4CAF50',
  },
  selectedExpenseButton: {
    backgroundColor: '#F44336',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  selectedIncomeText: {
    color: '#FFFFFF',
  },
  selectedExpenseText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#212121',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#212121',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;