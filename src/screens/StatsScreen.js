import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TimerContext } from '../context/TimerContext';
import { Ionicons } from '@expo/vector-icons';

const StatsScreen = ({ navigation }) => {
  const { history, completedPomodoros, dailyGoal, themeColor } = useContext(TimerContext);

  // Toplam Odaklanma Süresini Hesapla (Dakika cinsinden)
  const totalMinutes = history
    .filter(h => h.mode === 'Focus')
    .reduce((acc, curr) => acc + (curr.duration / 60), 0);

  // Basit İlerleme Çubuğu Hesaplaması
  const progressPercent = Math.min((completedPomodoros / dailyGoal) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>İSTATİSTİKLER</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* GÜNLÜK HEDEF KARTI */}
        <View style={styles.goalCard}>
          <Text style={styles.cardTitle}>GÜNLÜK HEDEF</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: themeColor }]} />
          </View>
          <Text style={styles.goalText}>
            {completedPomodoros} / {dailyGoal} Oturum
          </Text>
        </View>

        {/* ÖZET KARTLARI */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="time" size={24} color={themeColor} />
            <Text style={styles.statValue}>{Math.round(totalMinutes)}</Text>
            <Text style={styles.statLabel}>Toplam Dakika</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={24} color={themeColor} />
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Toplam Aktivite</Text>
          </View>
        </View>

        {/* GEÇMİŞ LİSTESİ */}
        <Text style={styles.historyTitle}>SON AKTİVİTELER</Text>
        {history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyLeft}>
              <View style={[styles.dot, { backgroundColor: item.mode === 'Focus' ? themeColor : '#888' }]} />
              <View>
                <Text style={styles.historyMode}>
                  {item.mode === 'Focus' ? 'Odaklanma' : item.mode === 'LongBreak' ? 'Uzun Mola' : 'Kısa Mola'}
                </Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
            </View>
            <Text style={styles.historyTime}>{item.timestamp}</Text>
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1E1E1E',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  goalText: {
    color: '#FFF',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#1E1E1E',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  historyTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  historyMode: {
    color: '#FFF',
    fontSize: 16,
  },
  historyDate: {
    color: '#666',
    fontSize: 12,
  },
  historyTime: {
    color: '#888',
    fontWeight: 'bold',
  }
});

export default StatsScreen;