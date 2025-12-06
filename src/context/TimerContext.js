import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { translations } from '../constants/translations';

export const TimerContext = createContext();

export const themes = [
  { id: 'DEFAULT', name: 'FocusFlow', bg: '#0F2027', accent: '#4A90E2', secondary: '#203A43', text: '#FFFFFF', font: 'System', strokeLinecap: 'round', borderRadius: 30, borderWidth: 0, borderColor: 'transparent' },
  { id: 'VALORANT', name: 'Valorant', bg: '#0F1923', accent: '#FF4655', secondary: '#ECE8E1', text: '#ECE8E1', font: 'System', strokeLinecap: 'square', borderRadius: 8, borderWidth: 0, borderColor: 'transparent' },
  { id: 'CYBERPUNK', name: 'Cyberpunk 2077', bg: '#050505', accent: '#00F0FF', secondary: '#FF003C', text: '#FCEE0A', font: 'monospace', strokeLinecap: 'square', borderRadius: 2, borderWidth: 2, borderColor: '#FCEE0A' },
  { id: 'BATMAN', name: 'Batman', bg: '#121212', accent: '#FFD700', secondary: '#333333', text: '#FFD700', font: 'System', strokeLinecap: 'butt', borderRadius: 15, borderWidth: 1, borderColor: '#FFD700' },
  { id: 'MINECRAFT', name: 'Minecraft', bg: '#181818', accent: '#589028', secondary: '#8B4513', text: '#FFFFFF', font: 'monospace', strokeLinecap: 'butt', borderRadius: 0, borderWidth: 4, borderColor: '#fff' },
  { id: 'MARVEL', name: 'Avengers', bg: '#151515', accent: '#ED1D24', secondary: '#FFFFFF', text: '#FFFFFF', font: 'System', strokeLinecap: 'round', borderRadius: 20, borderWidth: 1, borderColor: '#ED1D24' },
  { id: 'HARRYPOTTER', name: 'Hogwarts', bg: '#1A1A1A', accent: '#740001', secondary: '#D3A625', text: '#D3A625', font: 'serif', strokeLinecap: 'round', borderRadius: 50, borderWidth: 2, borderColor: '#D3A625' },
  { id: 'STRANGER', name: 'Stranger Things', bg: '#080808', accent: '#E71D36', secondary: '#B6B6B6', text: '#E71D36', font: 'serif', strokeLinecap: 'round', borderRadius: 10, borderWidth: 1, borderColor: '#E71D36' },
  { id: 'LOL', name: 'League of Legends', bg: '#091428', accent: '#C8AA6E', secondary: '#0AC8B9', text: '#F0E6D2', font: 'serif', strokeLinecap: 'round', borderRadius: 10, borderWidth: 2, borderColor: '#C8AA6E' },
  { id: 'NARUTO', name: 'Naruto', bg: '#191919', accent: '#FF8C00', secondary: '#0057B7', text: '#FF8C00', font: 'monospace', strokeLinecap: 'round', borderRadius: 15, borderWidth: 2, borderColor: '#000' },
  { id: 'RETRO', name: 'Neon 80s', bg: '#2b003b', accent: '#ff00ff', secondary: '#00ffff', text: '#00ffff', font: 'monospace', strokeLinecap: 'round', borderRadius: 25, borderWidth: 2, borderColor: '#ff00ff' },
  { id: 'MATRIX', name: 'Matrix', bg: '#000000', accent: '#00FF41', secondary: '#003B00', text: '#00FF41', font: 'monospace', strokeLinecap: 'square', borderRadius: 2, borderWidth: 1, borderColor: '#00FF41' },
];

const defaultPresets = [
  { id: 'p1', name: 'Klasik Odak', work: 25, short: 5, long: 15 },
  { id: 'p2', name: 'Derin Çalışma', work: 50, short: 10, long: 20 },
  { id: 'p3', name: 'Hızlı Pomodoro', work: 15, short: 3, long: 10 },
  { id: 'p4', name: 'Uzun Odak', work: 45, short: 15, long: 30 },
  { id: 'p5', name: 'Öğrenci Modu', work: 20, short: 5, long: 15 },
];

export const TimerProvider = ({ children }) => {
  const [workTime, setWorkTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  // VARSAYILAN OLARAK AÇIK YAPILDI
  const [autoStartBreak, setAutoStartBreak] = useState(true);
  const [autoStartPomodoro, setAutoStartPomodoro] = useState(true);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(true);

  const [history, setHistory] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [presets, setPresets] = useState(defaultPresets);
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language][key] || key;

  const playSound = async () => {
    if (!isSoundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' }
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Ses hatası:', error);
    }
  };

  const sendNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: isSoundEnabled },
      trigger: null,
    });
  };

  const addToHistory = (mode, durationSeconds) => {
    const newEntry = { date: new Date().toISOString(), mode, duration: durationSeconds };
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    saveData(updatedHistory);
  };

  const saveData = async (data) => {
    try { await AsyncStorage.setItem('@timer_history', JSON.stringify(data)); }
    catch (e) { console.error(e); }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@timer_history');
        if (jsonValue != null) setHistory(JSON.parse(jsonValue));
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  return (
    <TimerContext.Provider value={{
      workTime, setWorkTime,
      shortBreakTime, setShortBreakTime,
      longBreakTime, setLongBreakTime,
      longBreakInterval, setLongBreakInterval,
      autoStartBreak, setAutoStartBreak,
      autoStartPomodoro, setAutoStartPomodoro,
      isSoundEnabled, setIsSoundEnabled,
      showParticles, setShowParticles,
      history, addToHistory,
      themes, currentTheme, setCurrentTheme,
      presets, setPresets,
      playSound, sendNotification,
      language, setLanguage, t
    }}>
      {children}
    </TimerContext.Provider>
  );
};