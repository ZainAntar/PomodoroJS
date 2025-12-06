import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TimerContext } from '../context/TimerContext';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.75; // Ekranın %75'i büyüklüğünde
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { 
    workTime, shortBreakTime, longBreakTime, 
    themeColor, pomodorosUntilLongBreak, 
    autoStartBreak, autoStartPomodoro, addToHistory, completedPomodoros 
  } = useContext(TimerContext);

  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('Focus'); // 'Focus', 'ShortBreak', 'LongBreak'
  const [cycleCount, setCycleCount] = useState(0);

  // Animasyon Değerleri
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Toplam süre referansı (Daireyi doldurmak için)
  const totalTimeRef = useRef(workTime * 60);

  // Mod değiştiğinde süreyi ayarla
  useEffect(() => {
    let newTime = 0;
    if (mode === 'Focus') newTime = workTime * 60;
    else if (mode === 'ShortBreak') newTime = shortBreakTime * 60;
    else if (mode === 'LongBreak') newTime = longBreakTime * 60;
    
    setTimeLeft(newTime);
    totalTimeRef.current = newTime;
    
    // İbreyi sıfırla
    animatedProgress.setValue(0);
  }, [mode, workTime, shortBreakTime, longBreakTime]);

  // Sayaç Mantığı
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newVal = prev - 1;
          // Progress Bar Animasyonu
          const progress = 1 - (newVal / totalTimeRef.current);
          Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false, // SVG props için false olmalı
          }).start();
          return newVal;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    addToHistory(mode, totalTimeRef.current);

    if (mode === 'Focus') {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      
      if (newCycle % pomodorosUntilLongBreak === 0) {
        setMode('LongBreak');
        if (autoStartBreak) setIsActive(true);
      } else {
        setMode('ShortBreak');
        if (autoStartBreak) setIsActive(true);
      }
    } else {
      // Mola bitti
      setMode('Focus');
      if (autoStartPomodoro) setIsActive(true);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // SVG Çemberi için Animasyonlu Component
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  // strokeDashoffset hesaplaması: Çemberin ne kadarının dolacağını belirler
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#121212' }]}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
          <Ionicons name="options" size={26} color={themeColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColor }]}>
          {mode === 'Focus' ? 'ODAKLAN' : mode === 'LongBreak' ? 'UZUN MOLA' : 'KISA MOLA'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')} style={styles.iconBtn}>
          <Ionicons name="bar-chart" size={26} color={themeColor} />
        </TouchableOpacity>
      </View>

      {/* Dairesel Sayaç */}
      <View style={styles.timerContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          {/* Arka Plan Dairesi */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke="#333"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* İlerleme Dairesi */}
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={themeColor}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
          />
        </Svg>
        
        <View style={styles.timerTextContainer}>
          <Text style={[styles.timerText, { color: '#FFF' }]}>{formatTime(timeLeft)}</Text>
          <Text style={styles.cycleText}>{cycleCount} / {pomodorosUntilLongBreak} Döngü</Text>
        </View>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.mainButton, { backgroundColor: themeColor }]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={40} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={() => {
            setIsActive(false);
            setMode('Focus');
            setCycleCount(0);
            setTimeLeft(workTime * 60);
            animatedProgress.setValue(0);
          }}
        >
          <Ionicons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconBtn: {
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 60,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  cycleText: {
    color: '#666',
    marginTop: 5,
    fontSize: 14,
  },
  controls: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  resetButton: {
    padding: 10,
  }
});

export default HomeScreen;