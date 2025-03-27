import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { useAINews } from '@/hooks/useAINews';
import { Search as SearchIcon, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { searchNews, searchResults, loading } = useAINews();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      await searchNews(query);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(err => 
        console.error('Error al abrir el enlace:', err)
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search AI news..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading || isSearching}>
          {(loading || isSearching) ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <SearchIcon size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
      >
        {searchResults.length === 0 && query.trim() !== '' && !loading && !isSearching && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No se encontraron resultados para "{query}"</Text>
            <TouchableOpacity
              style={styles.googleSearchButton}
              onPress={() => {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' AI news')}`;
                Linking.openURL(googleUrl);
              }}
            >
              <Text style={styles.googleSearchText}>Buscar en Google</Text>
            </TouchableOpacity>
          </View>
        )}
        {searchResults.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              {result.link && (
                <TouchableOpacity 
                  onPress={() => handleOpenLink(result.link!)}
                  style={styles.linkButton}
                >
                  <ExternalLink size={20} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.resultDescription}>{result.description}</Text>
            {result.date && (
              <Text style={styles.resultDate}>{result.date}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#999999',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1c1c1e',
    flex: 1,
    marginRight: 8,
  },
  resultDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8e8e93',
  },
  linkButton: {
    padding: 4,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
  },
  noResultsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  googleSearchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  googleSearchText: {
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});