import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Easing, Vibration, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TimerContext } from '../context/TimerContext';
import Svg, { Circle } from 'react-native-svg';
import BackgroundParticles from '../components/BackgroundParticles';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const HomeScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const {
    currentTheme, workTime, shortBreakTime, longBreakTime,
    addToHistory, autoStartBreak, autoStartPomodoro, longBreakInterval,
    setWorkTime, setShortBreakTime, setLongBreakTime, presets,
    playSound, sendNotification, showParticles, t, language
  } = useContext(TimerContext);

  const containerWidth = width > 450 ? 375 : width;
  const CIRCLE_SIZE = containerWidth * 0.75;
  const [modalVisible, setModalVisible] = useState(false);
  const [quote, setQuote] = useState("");

  // Quote Rotation Logic
  useEffect(() => {
    const quotes = t('quotes');
    if (quotes && Array.isArray(quotes)) {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      const interval = setInterval(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      }, 10000); // Change every 10 seconds
      return () => clearInterval(interval);
    }
  }, [language, t]);
  const STROKE_WIDTH = currentTheme.id === 'MINECRAFT' ? 22 : 15;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // State
  const [mode, setMode] = useState('Focus');
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);


  // Refs (Animation & Values)
  const animatedValue = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Helpers
  const getTotalTimeInSeconds = (currentMode) => {
    if (currentMode === 'Focus') return workTime * 60;
    if (currentMode === 'ShortBreak') return shortBreakTime * 60;
    return longBreakTime * 60;
  };

  const getContrastColor = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  };

  // Ayarlar değişince zamanı güncelle (Eğer çalışmıyorsa)
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getTotalTimeInSeconds(mode));
    }
  }, [workTime, shortBreakTime, longBreakTime]);

  // TIMER LOGIC (CRITICAL FIX)
  // Refs for stable access in intervals
  const timeLeftRef = useRef(timeLeft);
  const handleCompleteRef = useRef(null);



  const handleComplete = async () => {
    // 1. Stop everything immediately
    setIsActive(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    // 2. Play effects (Non-blocking)
    try {
      await playSound();
      await sendNotification(t('timeUp'), mode === 'Focus' ? t('breakTime') : t('backToWork'));
      Vibration.vibrate([0, 500, 200, 500]);
    } catch (error) {
      console.log("Effect error:", error);
    }

    // 3. Update Logic
    addToHistory(mode, getTotalTimeInSeconds(mode));

    // Mod Değiştirme Mantığı
    let nextMode = 'Focus';
    let shouldAutoStart = false;

    if (mode === 'Focus') {
      const newCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newCompleted);
      nextMode = (newCompleted % longBreakInterval === 0) ? 'LongBreak' : 'ShortBreak';
      shouldAutoStart = autoStartBreak;
    } else {
      nextMode = 'Focus';
      shouldAutoStart = autoStartPomodoro;
    }

    // Yeni moda geç
    setMode(nextMode);
    const newTime = getTotalTimeInSeconds(nextMode);
    setTimeLeft(newTime);

    // Animasyonu sıfırla (Dolu hale getir)
    animatedValue.setValue(1);

    // Otomatik Başlatma
    if (shouldAutoStart) {
      setTimeout(() => setIsActive(true), 500);
    }
  };

  // Update refs
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    handleCompleteRef.current = handleComplete;
  }, [handleComplete]);

  // TIMER LOGIC (OPTIMIZED)
  useEffect(() => {
    let interval = null;

    if (isActive) {
      // Daire Animasyonu Başlat
      const totalTime = getTotalTimeInSeconds(mode);
      // Use current timeLeft from ref to avoid stale closure if needed, 
      // but here we just need the start value for animation.
      // Since isActive changed to true, timeLeft is fresh from render.

      Animated.timing(animatedValue, {
        toValue: 0,
        duration: timeLeft * 1000,
        easing: Easing.linear,
        useNativeDriver: false
      }).start();

      // Sayaç Döngüsü
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Son 5 saniye animasyonu - This needs to check timeLeft continuously?
      // The previous code checked timeLeft <= 6 inside the effect. 
      // But since the effect doesn't run every second anymore, this won't trigger automatically 
      // unless we move it to the interval or a separate effect.

    } else {
      clearInterval(interval);
      animatedValue.stopAnimation();
      // Durdurunca animasyon değerini o anki zamana göre senkronize et
      const totalTime = getTotalTimeInSeconds(mode);
      // Use ref here to get latest timeLeft without adding it to dependencies
      animatedValue.setValue(timeLeftRef.current / totalTime);
    }

    return () => clearInterval(interval);
  }, [isActive, mode]); // Removed timeLeft from dependencies

  // Separate effect for pulse animation near end
  useEffect(() => {
    if (isActive && timeLeft <= 6 && timeLeft > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else if (!isActive || timeLeft > 6) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [timeLeft, isActive]);

  const toggleTimer = () => {
    Vibration.vibrate(50);
    setIsActive(!isActive);
  };

  const handleReset = () => {
    Vibration.vibrate(50);
    setIsActive(false);
    setTimeLeft(getTotalTimeInSeconds(mode));
    animatedValue.stopAnimation();
    animatedValue.setValue(1);
    pulseAnim.setValue(1);
  };

  const applyPreset = (preset) => {
    setWorkTime(preset.work);
    setShortBreakTime(preset.short);
    setLongBreakTime(preset.long);
    setModalVisible(false);

    setMode('Focus');
    setIsActive(false);
    setTimeLeft(preset.work * 60);
    animatedValue.setValue(1);
  };

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <BackgroundParticles color={currentTheme.accent} enabled={showParticles} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBox}>
          <Ionicons name="settings-sharp" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: currentTheme.text, fontFamily: currentTheme.font }]}>
              {currentTheme.name.toUpperCase()}
            </Text>
            <Text style={{ color: currentTheme.text, fontSize: 10, opacity: 0.6 }}>
              {pomodorosCompleted} / {longBreakInterval} {t('cycle')}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={currentTheme.text} style={{ opacity: 0.7 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')} style={styles.iconBox}>
          <Ionicons name="stats-chart" size={24} color={currentTheme.text} />
        </TouchableOpacity>
      </View>

      {/* TIMER */}
      <View style={styles.timerContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <Circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} stroke={currentTheme.secondary} strokeWidth={STROKE_WIDTH} fill="transparent" />
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS}
            stroke={currentTheme.accent} strokeWidth={STROKE_WIDTH} fill="transparent"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
            strokeLinecap={currentTheme.strokeLinecap} rotation="-90" origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
          />
        </Svg>

        <View style={styles.timerTextContainer}>
          <Animated.Text style={[
            styles.timerText,
            { color: currentTheme.text, fontFamily: currentTheme.font, fontVariant: ['tabular-nums'], transform: [{ scale: pulseAnim }] }
          ]}>
            {formatTime(timeLeft)}
          </Animated.Text>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={[styles.modeText, { color: currentTheme.text, opacity: 0.7, fontFamily: currentTheme.font }]}>
              {mode === 'Focus' ? t('focus') : (mode === 'ShortBreak' ? t('shortBreak') : t('longBreak'))}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={toggleTimer} activeOpacity={0.7}
          style={[styles.mainBtn, {
            backgroundColor: currentTheme.accent, borderRadius: currentTheme.borderRadius,
            borderWidth: currentTheme.borderWidth, borderColor: currentTheme.borderColor,
            shadowColor: currentTheme.accent, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
          }]}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={45} color={getContrastColor(currentTheme.accent)} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReset} activeOpacity={0.7}
          style={[styles.subBtn, { backgroundColor: currentTheme.secondary, borderRadius: currentTheme.borderRadius }]}
        >
          <Ionicons name="refresh" size={24} color={getContrastColor(currentTheme.secondary)} />
        </TouchableOpacity>
      </View>

      {/* MOTIVATIONAL QUOTE */}
      <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center', paddingHorizontal: 20 }}>
        <Text style={{
          color: currentTheme.text,
          opacity: 0.6,
          fontSize: 14,
          fontStyle: 'italic',
          textAlign: 'center',
          fontFamily: currentTheme.font
        }}>
          "{quote}"
        </Text>
      </View>

      {/* PRESET MODAL (BOTTOM SHEET) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={[styles.bottomSheet, { backgroundColor: currentTheme.bg, shadowColor: currentTheme.accent }]}>
            <View style={[styles.dragHandle, { backgroundColor: currentTheme.secondary }]} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontFamily: currentTheme.font }]}>{t('selectMode')}</Text>
              {/* Close button optional since it's a bottom sheet, but good to have */}
            </View>
            <FlatList
              data={presets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => applyPreset(item)}
                  style={[styles.presetRow, {
                    backgroundColor: currentTheme.secondary + '30', // Slightly more opaque
                    borderWidth: 1,
                    borderColor: currentTheme.secondary + '50'
                  }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: currentTheme.accent + '20', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="timer-outline" size={20} color={currentTheme.accent} />
                    </View>
                    <View>
                      <Text style={{ color: currentTheme.text, fontWeight: 'bold', fontFamily: currentTheme.font, fontSize: 15 }}>{item.name}</Text>
                      <Text style={{ color: currentTheme.text, opacity: 0.6, fontSize: 12 }}>{item.work} / {item.short} / {item.long} min</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={currentTheme.text} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  header: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, zIndex: 10 },
  iconBox: { padding: 10 },
  headerTitle: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  timerContainer: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  timerTextContainer: { position: 'absolute', alignItems: 'center' },
  timerText: { fontSize: 72, fontWeight: 'bold' },
  modeText: { fontSize: 16, marginTop: 5, letterSpacing: 2, textDecorationLine: 'underline' },
  controls: { alignItems: 'center', gap: 25, marginBottom: 20, zIndex: 10 },
  mainBtn: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  subBtn: { padding: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { width: '100%', padding: 20, paddingBottom: 40, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, maxHeight: '60%' },
  dragHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20, opacity: 0.5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  presetRow: { padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});

export default HomeScreen;