import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAINews } from '@/hooks/useAINews';
import { RefreshCw } from 'lucide-react-native';

export default function LatestScreen() {
  const { getLatestNews, news, loading } = useAINews();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getLatestNews();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getLatestNews();
    setRefreshing(false);
  }, [getLatestNews]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest AI News</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={loading || refreshing}
        >
          <RefreshCw 
            size={20} 
            color="#007AFF"
            style={[
              styles.refreshIcon,
              (loading || refreshing) && styles.refreshing
            ]} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.newsContainer}>
          {loading && !refreshing ? (
            <Text style={styles.loadingText}>Loading latest AI news...</Text>
          ) : (
            news.map((item, index) => (
              <View key={index} style={styles.newsCard}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsDescription}>{item.description}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1c1c1e',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  refreshIcon: {
    opacity: 1,
  },
  refreshing: {
    opacity: 0.5,
    transform: [{ rotate: '45deg' }],
  },
  content: {
    flex: 1,
  },
  newsContainer: {
    padding: 16,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#1c1c1e',
  },
  newsDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  newsDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8e8e93',
  },
});