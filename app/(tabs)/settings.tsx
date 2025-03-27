import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAINews } from '@/hooks/useAINews';

export default function SettingsScreen() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const { setupGoogleCredentials } = useAINews();

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const savedOpenAIKey = await AsyncStorage.getItem('openai_api_key');
      const savedGoogleKey = await AsyncStorage.getItem('google_api_key');
      if (savedOpenAIKey) setOpenaiKey(savedOpenAIKey);
      if (savedGoogleKey) setGoogleApiKey(savedGoogleKey);
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  };

  const handleSaveOpenAI = async () => {
    try {
      if (openaiKey.trim()) {
        await AsyncStorage.setItem('openai_api_key', openaiKey.trim());
        Alert.alert('Success', 'OpenAI API key saved successfully');
      } else {
        await AsyncStorage.removeItem('openai_api_key');
        Alert.alert('Info', 'OpenAI API key removed');
      }
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      Alert.alert('Error', 'Failed to save OpenAI API key');
    }
  };

  const handleSaveGoogle = async () => {
    try {
      if (googleApiKey.trim()) {
        await setupGoogleCredentials(googleApiKey.trim());
        Alert.alert('Success', 'Google Search configuration saved successfully');
      } else {
        await AsyncStorage.removeItem('google_api_key');
        Alert.alert('Info', 'Google Search configuration removed');
      }
    } catch (error) {
      console.error('Error saving Google key:', error);
      Alert.alert('Error', 'Failed to save Google Search configuration');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OpenAI API Key"
          value={openaiKey}
          onChangeText={setOpenaiKey}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveOpenAI}>
          <Text style={styles.buttonText}>Save OpenAI Key</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Google Search Configuration</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Google API Key"
          value={googleApiKey}
          onChangeText={setGoogleApiKey}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveGoogle}>
          <Text style={styles.buttonText}>Save Google Key</Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          Note: Google Search will be used as a fallback when OpenAI is not configured
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1c1c1e',
    fontFamily: 'Inter_700Bold',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  note: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
});