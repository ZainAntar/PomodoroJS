import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  // --- Ayarlar State'leri ---
  const [workTime, setWorkTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4);
  const [dailyGoal, setDailyGoal] = useState(8);
  
  const [themeColor, setThemeColor] = useState('#C0A062'); // Varsayılan Gold
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  const [autoStartPomodoro, setAutoStartPomodoro] = useState(false);
  const [keepAwake, setKeepAwake] = useState(true);
  
  // --- İstatistik & Durum State'leri ---
  const [history, setHistory] = useState([]);
  const [completedPomodoros, setCompletedPomodoros] = useState(0); // Bugün tamamlanan

  useKeepAwake(); // Telefonun uyumasını engelle (Basit yöntem)

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    saveSettings();
  }, [workTime, shortBreakTime, longBreakTime, themeColor, autoStartBreak, autoStartPomodoro, dailyGoal, history]);

  const loadSettings = async () => {
    try {
      const keys = ['workTime', 'shortBreakTime', 'longBreakTime', 'themeColor', 'history', 'dailyGoal'];
      const result = await AsyncStorage.multiGet(keys);
      
      if (result[0][1]) setWorkTime(parseInt(result[0][1]));
      if (result[1][1]) setShortBreakTime(parseInt(result[1][1]));
      if (result[2][1]) setLongBreakTime(parseInt(result[2][1]));
      if (result[3][1]) setThemeColor(result[3][1]);
      if (result[4][1]) setHistory(JSON.parse(result[4][1]));
      if (result[5][1]) setDailyGoal(parseInt(result[5][1]));
    } catch (e) { console.log(e); }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.multiSet([
        ['workTime', workTime.toString()],
        ['shortBreakTime', shortBreakTime.toString()],
        ['longBreakTime', longBreakTime.toString()],
        ['themeColor', themeColor],
        ['history', JSON.stringify(history)],
        ['dailyGoal', dailyGoal.toString()]
      ]);
    } catch (e) { console.log(e); }
  };

  const addToHistory = (mode, duration) => {
    const today = new Date().toLocaleDateString();
    const newEntry = {
      id: Date.now(),
      mode,
      duration,
      date: today,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    // Geçmişi güncelle
    setHistory(prev => [newEntry, ...prev]);

    // Bugün kaç tane tamamlandı sayacını güncelle
    if (mode === 'Focus') {
      setCompletedPomodoros(prev => prev + 1);
    }
  };

  return (
    <TimerContext.Provider value={{
      workTime, setWorkTime,
      shortBreakTime, setShortBreakTime,
      longBreakTime, setLongBreakTime,
      pomodorosUntilLongBreak, setPomodorosUntilLongBreak,
      dailyGoal, setDailyGoal,
      themeColor, setThemeColor,
      autoStartBreak, setAutoStartBreak,
      autoStartPomodoro, setAutoStartPomodoro,
      keepAwake, setKeepAwake,
      history, addToHistory,
      completedPomodoros, setCompletedPomodoros
    }}>
      {children}
    </TimerContext.Provider>
  );
};