import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { TimerContext } from '../context/TimerContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const { 
    workTime, setWorkTime, 
    shortBreakTime, setShortBreakTime, 
    longBreakTime, setLongBreakTime,
    themeColor, setThemeColor,
    pomodorosUntilLongBreak, setPomodorosUntilLongBreak,
    autoStartBreak, setAutoStartBreak,
    autoStartPomodoro, setAutoStartPomodoro,
    dailyGoal, setDailyGoal
  } = useContext(TimerContext);

  const colors = ['#C0A062', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#1abc9c', '#f1c40f', '#e67e22'];

  const DurationCard = ({ label, value, setter }) => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.cardControls}>
        <TouchableOpacity onPress={() => value > 1 && setter(value - 1)}>
          <Ionicons name="remove" size={20} color="#888" />
        </TouchableOpacity>
        <Text style={[styles.cardValue, { color: themeColor }]}>{value}</Text>
        <TouchableOpacity onPress={() => setter(value + 1)}>
          <Ionicons name="add" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AYARLAR</Text>
        <View style={{width:28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SÜRELER */}
        <Text style={styles.sectionTitle}>SÜRELER (DK)</Text>
        <View style={styles.grid}>
          <DurationCard label="Pomodoro" value={workTime} setter={setWorkTime} />
          <DurationCard label="Kısa Mola" value={shortBreakTime} setter={setShortBreakTime} />
          <DurationCard label="Uzun Mola" value={longBreakTime} setter={setLongBreakTime} />
        </View>

        {/* RENK TEMALARI */}
        <Text style={styles.sectionTitle}>RENK TEMASI</Text>
        <View style={styles.colorGrid}>
          {colors.map((c) => (
            <TouchableOpacity 
              key={c} 
              style={[styles.colorItem, { backgroundColor: c }, themeColor === c && styles.selectedColor]} 
              onPress={() => setThemeColor(c)}
            >
              {themeColor === c && <Ionicons name="checkmark" size={20} color="#FFF" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* DİĞER TERCİHLER */}
        <Text style={styles.sectionTitle}>DİĞER TERCİHLER</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Uzun Mola İçin Pomodoro Sayısı</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => pomodorosUntilLongBreak > 1 && setPomodorosUntilLongBreak(p => p-1)}>
               <Ionicons name="remove-circle" size={24} color="#555" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{pomodorosUntilLongBreak}</Text>
            <TouchableOpacity onPress={() => setPomodorosUntilLongBreak(p => p+1)}>
               <Ionicons name="add-circle" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Günlük Hedef (Oturum)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => dailyGoal > 1 && setDailyGoal(p => p-1)}>
               <Ionicons name="remove-circle" size={24} color="#555" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{dailyGoal}</Text>
            <TouchableOpacity onPress={() => setDailyGoal(p => p+1)}>
               <Ionicons name="add-circle" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>Molaları Otomatik Başlat</Text>
          <Switch 
            value={autoStartBreak} 
            onValueChange={setAutoStartBreak}
            trackColor={{ false: "#333", true: themeColor }}
            thumbColor={autoStartBreak ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>Pomodoro'ları Otomatik Başlat</Text>
          <Switch 
            value={autoStartPomodoro} 
            onValueChange={setAutoStartPomodoro}
            trackColor={{ false: "#333", true: themeColor }}
            thumbColor={autoStartPomodoro ? "#fff" : "#f4f3f4"}
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    width: '31%',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#888',
    fontSize: 10,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  cardControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  colorItem: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
  },
  rowLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default SettingsScreen;