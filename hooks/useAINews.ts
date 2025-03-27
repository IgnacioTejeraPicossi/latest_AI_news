import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAI from 'openai';
import { Alert } from 'react-native';

interface NewsItem {
  title: string;
  description: string;
  date?: string;
  link?: string;
}

// Datos predefinidos iniciales
const INITIAL_NEWS: NewsItem[] = [
  {
    title: "ChatGPT alcanza nuevo récord de usuarios",
    description: "La plataforma de IA de OpenAI supera los 100 millones de usuarios activos mensuales, estableciendo un nuevo estándar en la adopción de IA conversacional.",
    date: "2024-03-01"
  },
  {
    title: "Google lanza Gemini Advanced",
    description: "Google presenta Gemini Advanced, su modelo de IA más potente hasta la fecha, compitiendo directamente con GPT-4 en capacidades multimodales.",
    date: "2024-02-28"
  },
  {
    title: "Avances en IA generativa de imágenes",
    description: "Nuevos modelos de IA pueden crear imágenes fotorrealistas con mayor precisión y control, revolucionando el campo del diseño digital.",
    date: "2024-02-25"
  }
];

// Configuración de Google Search
const GOOGLE_CX = 'f612415db744c4938';
const GOOGLE_API_KEY = 'AIzaSyA1UDOPoKbQSWXCEki1slq4fZGIMA9MyyI';

// Función para obtener noticias de Google
const fetchGoogleNews = async (query: string): Promise<NewsItem[]> => {
  try {
    // Usar directamente la API key configurada
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query + ' artificial intelligence news')}&num=10`;
    
    console.log('Fetching from Google Search:', searchUrl);
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Search API error:', data);
      return [];
    }

    if (!data.items || data.items.length === 0) {
      console.log('No results found from Google Search');
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title,
      description: item.snippet,
      date: new Date().toLocaleDateString(),
      link: item.link
    }));
  } catch (error) {
    console.error('Error in fetchGoogleNews:', error);
    return [];
  }
};

export function useAINews() {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [searchResults, setSearchResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<NewsItem[]>([]);

  const getOpenAIClient = async () => {
    try {
      const apiKey = await AsyncStorage.getItem('openai_api_key');
      console.log('API Key status:', apiKey ? 'Found' : 'Not found');
      if (!apiKey) {
        return null;
      }
      return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    } catch (error) {
      console.error('Error getting OpenAI client:', error);
      return null;
    }
  };

  // Función para actualizar el historial de búsquedas
  const updateSearchHistory = (newItems: NewsItem[]) => {
    setSearchHistory(prevHistory => {
      // Combinar los nuevos items con el historial existente
      const combined = [...newItems, ...prevHistory];
      // Eliminar duplicados basados en el título
      const unique = combined.filter((item, index, self) =>
        index === self.findIndex(t => t.title === item.title)
      );
      // Mantener solo los últimos 5 items
      return unique.slice(0, 5);
    });
  };

  // Función de búsqueda local como respaldo
  const searchLocally = (query: string): NewsItem[] => {
    const searchTerms = query.toLowerCase().split(' ');
    const allNews = [...searchHistory, ...INITIAL_NEWS];
    return allNews.filter(item => {
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      return searchTerms.some(term => 
        titleLower.includes(term) || descLower.includes(term)
      );
    });
  };

  const getLatestNews = useCallback(async () => {
    try {
      setLoading(true);
      const openai = await getOpenAIClient();

      if (!openai) {
        console.log('No API key found, using Google Search for latest AI news');
        const googleResults = await fetchGoogleNews('latest artificial intelligence');
        if (googleResults.length > 0) {
          updateSearchHistory(googleResults);
          setNews(googleResults);
        } else {
          setNews([...searchHistory, ...INITIAL_NEWS].slice(0, 5));
        }
        return;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a news curator focused on the latest AI developments. Provide very recent news from the last few days."
          },
          {
            role: "user",
            content: "What are the most recent and significant AI developments from the last few days? Give 3 news items with actual dates."
          }
        ],
        temperature: 0.7,
        max_tokens: 150
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

      updateSearchHistory(newsItems);
      setNews(newsItems);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      const googleResults = await fetchGoogleNews('latest artificial intelligence');
      if (googleResults.length > 0) {
        updateSearchHistory(googleResults);
        setNews(googleResults);
      } else {
        setNews([...searchHistory, ...INITIAL_NEWS].slice(0, 5));
      }
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  const searchNews = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Starting search for query:', query);
      
      // Primero intentamos con OpenAI
      const openai = await getOpenAIClient();
      if (openai) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "Provide brief AI news summaries."
              },
              {
                role: "user",
                content: `Give 2 brief news items about: ${query}. Keep each response under 50 words.`
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          });

          const content = response.choices[0].message.content;
          if (content) {
            const results = content.split('\n\n').filter(item => item.trim()).map(item => {
              const [title, ...descParts] = item.split('\n');
              return {
                title: title.replace(/^\d+\.\s*/, '').trim(),
                description: descParts.join('\n').trim(),
                date: new Date().toLocaleDateString(),
              };
            });
            updateSearchHistory(results);
            setSearchResults(results);
            return;
          }
        } catch (openaiError) {
          console.error('OpenAI search failed:', openaiError);
        }
      }

      // Si OpenAI no está disponible o falla, usamos la búsqueda local
      console.log('Using local search');
      const localResults = searchLocally(query);
      
      // Si encontramos resultados locales, los usamos
      if (localResults.length > 0) {
        setSearchResults(localResults);
        return;
      }

      // Si no hay resultados locales, devolvemos un resultado que sugiere buscar en Google
      setSearchResults([{
        title: 'No se encontraron resultados en la base de datos local',
        description: `No se encontraron resultados para "${query}" en nuestra base de datos. Puedes intentar buscar en Google para obtener información más actualizada.`,
        date: new Date().toLocaleDateString(),
        link: `https://www.google.com/search?q=${encodeURIComponent(query + ' AI news')}`
      }]);

    } catch (error) {
      console.error('Error in searchNews:', error);
      // En caso de error, mostramos un mensaje amigable
      setSearchResults([{
        title: 'Error en la búsqueda',
        description: 'Hubo un problema al realizar la búsqueda. Por favor, intenta de nuevo o usa el botón de búsqueda en Google.',
        date: new Date().toLocaleDateString()
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getNewsByTopic = useCallback(async (topic: string) => {
    try {
      setLoading(true);
      const openai = await getOpenAIClient();

      if (!openai) {
        console.log('No API key found, using Google Search for topic:', topic);
        const googleResults = await fetchGoogleNews(topic);
        if (googleResults.length > 0) {
          updateSearchHistory(googleResults);
          setNews(googleResults);
        } else {
          const filteredNews = searchLocally(topic);
          setNews(filteredNews);
        }
        return;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Provide brief AI news summaries."
          },
          {
            role: "user",
            content: `Give 3 brief news items about: ${topic}. Keep each response under 50 words.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      const newsItems = content.split('\n\n').filter(item => item.trim()).map(item => {
        const [title, ...descParts] = item.split('\n');
        const newsItem = {
          title: title.replace(/^\d+\.\s*/, '').trim(),
          description: descParts.join('\n').trim(),
          date: new Date().toLocaleDateString(),
        };
        return newsItem;
      });

      updateSearchHistory(newsItems);
      setNews(newsItems);
    } catch (error: any) {
      console.error('Error fetching topic news:', error);
      const googleResults = await fetchGoogleNews(topic);
      if (googleResults.length > 0) {
        updateSearchHistory(googleResults);
        setNews(googleResults);
      } else {
        const filteredNews = searchLocally(topic);
        setNews(filteredNews);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para configurar las credenciales de Google
  const setupGoogleCredentials = useCallback(async (apiKey?: string) => {
    // La API key ya está configurada, así que simplemente retornamos true
    return true;
  }, []);

  return {
    news,
    searchResults,
    loading,
    getLatestNews,
    getNewsByTopic,
    searchNews,
    setupGoogleCredentials,
  };
}