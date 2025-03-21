import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAINews } from '@/hooks/useAINews';

const TOPICS = [
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Robotics',
  'Neural Networks',
  'Deep Learning',
  'Reinforcement Learning',
  'AI Ethics',
  'AI in Healthcare',
  'AI in Business',
];

export default function TopicsScreen() {
  const { getNewsByTopic, loading } = useAINews();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {TOPICS.map((topic, index) => (
          <TouchableOpacity
            key={index}
            style={styles.topicCard}
            onPress={() => getNewsByTopic(topic)}
            disabled={loading}>
            <Text style={styles.topicText}>{topic}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  topicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
  topicText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1c1c1e',
  },
});