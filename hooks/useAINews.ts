import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAI from 'openai';

interface NewsItem {
  title: string;
  description: string;
  date?: string;
}

export function useAINews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchResults, setSearchResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getOpenAIClient = async () => {
    const apiKey = await AsyncStorage.getItem('openai_api_key');
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in the settings.');
    }
    return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  };

  const getLatestNews = useCallback(async () => {
    try {
      setLoading(true);
      const openai = await getOpenAIClient();

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI news curator. Provide the latest developments in AI technology in a structured format."
          },
          {
            role: "user",
            content: "What are the latest developments in AI? Please provide 5 recent news items with titles and descriptions."
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      // Parse the response into structured news items
      const newsItems = content.split('\n\n').filter(item => item.trim()).map(item => {
        const [title, ...descParts] = item.split('\n');
        return {
          title: title.replace(/^\d+\.\s*/, '').trim(),
          description: descParts.join('\n').trim(),
          date: new Date().toLocaleDateString(),
        };
      });

      setNews(newsItems);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getNewsByTopic = useCallback(async (topic: string) => {
    try {
      setLoading(true);
      const openai = await getOpenAIClient();

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI news curator specializing in specific AI topics."
          },
          {
            role: "user",
            content: `What are the latest developments in ${topic}? Please provide 3 recent news items.`
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      const newsItems = content.split('\n\n').filter(item => item.trim()).map(item => {
        const [title, ...descParts] = item.split('\n');
        return {
          title: title.replace(/^\d+\.\s*/, '').trim(),
          description: descParts.join('\n').trim(),
          date: new Date().toLocaleDateString(),
        };
      });

      setNews(newsItems);
    } catch (error) {
      console.error('Error fetching topic news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchNews = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const openai = await getOpenAIClient();

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI news search engine. Provide relevant AI news based on the search query."
          },
          {
            role: "user",
            content: `Search for AI news related to: ${query}. Please provide 3 relevant results.`
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      const results = content.split('\n\n').filter(item => item.trim()).map(item => {
        const [title, ...descParts] = item.split('\n');
        return {
          title: title.replace(/^\d+\.\s*/, '').trim(),
          description: descParts.join('\n').trim(),
        };
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching news:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    news,
    searchResults,
    loading,
    getLatestNews,
    getNewsByTopic,
    searchNews,
  };
}