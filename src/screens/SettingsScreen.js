import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { TimerContext } from '../context/TimerContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const {
    workTime, setWorkTime,
    shortBreakTime, setShortBreakTime,
    longBreakTime, setLongBreakTime,
    autoStartBreak, setAutoStartBreak,
    autoStartPomodoro, setAutoStartPomodoro,
    longBreakInterval, setLongBreakInterval,
    themes, currentTheme, setCurrentTheme,
    isSoundEnabled, setIsSoundEnabled,
    showParticles, setShowParticles,
    language, setLanguage, t
  } = useContext(TimerContext);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', label: 'العربية', flag: '🇦🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const currentLang = languages.find(l => l.code === language) || languages[0];

  const SettingSection = ({ title, icon, children }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={currentTheme.accent} style={{ marginRight: 8 }} />
        <Text style={[styles.sectionTitle, { color: currentTheme.accent, fontFamily: currentTheme.font }]}>{title.toUpperCase()}</Text>
      </View>
      <View style={[styles.sectionContent, { backgroundColor: currentTheme.secondary + '15', borderColor: currentTheme.secondary + '30' }]}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ label, value, onToggle, type = 'switch', setter }) => (
    <View style={[styles.row, { borderBottomColor: currentTheme.secondary + '20' }]}>
      <Text style={[styles.label, { color: currentTheme.text, fontFamily: currentTheme.font }]}>{label}</Text>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#555", true: currentTheme.accent }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
        />
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={() => setter(Math.max(1, value - 1))} style={[styles.counterBtn, { backgroundColor: currentTheme.secondary }]}>
            <Ionicons name="remove" size={16} />
          </TouchableOpacity>
          <Text style={[styles.valueText, { color: currentTheme.text }]}>{value}</Text>
          <TouchableOpacity onPress={() => setter(value + 1)} style={[styles.counterBtn, { backgroundColor: currentTheme.secondary }]}>
            <Ionicons name="add" size={16} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text, fontFamily: currentTheme.font }]}>{t('settings')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* YENİ: UYGULAMA AYARLARI */}
        <SettingSection title={t('appSettings')} icon="options-outline">
          <SettingRow label={t('soundEffects')} value={isSoundEnabled} onToggle={setIsSoundEnabled} />
          <SettingRow label={t('bgEffects')} value={showParticles} onToggle={setShowParticles} />

          {/* Language Selector Trigger */}
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: currentTheme.secondary + '20' }]}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Text style={[styles.label, { color: currentTheme.text, fontFamily: currentTheme.font }]}>{t('language')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>{currentLang.flag}</Text>
              <Text style={{ color: currentTheme.text, opacity: 0.7, fontSize: 14 }}>{currentLang.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={currentTheme.text} style={{ opacity: 0.5 }} />
            </View>
          </TouchableOpacity>
        </SettingSection>

        {/* Language Modal */}
        <Modal animationType="fade" transparent={true} visible={languageModalVisible} onRequestClose={() => setLanguageModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLanguageModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: currentTheme.bg, borderColor: currentTheme.accent, shadowColor: currentTheme.accent }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text, fontFamily: currentTheme.font }]}>{t('language')}</Text>
              <FlatList
                data={languages}
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => { setLanguage(item.code); setLanguageModalVisible(false); }}
                    style={[styles.langOption, { backgroundColor: language === item.code ? currentTheme.accent + '20' : 'transparent' }]}
                  >
                    <Text style={{ fontSize: 20 }}>{item.flag}</Text>
                    <Text style={{ color: currentTheme.text, fontSize: 16, flex: 1, marginLeft: 10, textAlign: 'left', fontWeight: language === item.code ? 'bold' : 'normal' }}>
                      {item.label}
                    </Text>
                    {language === item.code && <Ionicons name="checkmark" size={20} color={currentTheme.accent} />}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: currentTheme.secondary + '20' }} />}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <SettingSection title={t('timerSettings')} icon="timer-outline">
          <SettingRow label={t('focusTime')} value={workTime} type="number" setter={setWorkTime} />
          <SettingRow label={t('shortBreakTime')} value={shortBreakTime} type="number" setter={setShortBreakTime} />
          <SettingRow label={t('longBreakTime')} value={longBreakTime} type="number" setter={setLongBreakTime} />
        </SettingSection>

        <SettingSection title={t('automation')} icon="construct-outline">
          <SettingRow label={t('autoStartBreak')} value={autoStartBreak} onToggle={setAutoStartBreak} />
          <SettingRow label={t('autoStartFocus')} value={autoStartPomodoro} onToggle={setAutoStartPomodoro} />
          <SettingRow label={t('longBreakInterval')} value={longBreakInterval} type="number" setter={setLongBreakInterval} />
        </SettingSection>

        <SettingSection title={t('howToUse')} icon="help-circle-outline">
          <View style={{ padding: 15 }}>
            <Text style={{ color: currentTheme.text, fontSize: 14, lineHeight: 22, fontFamily: currentTheme.font, opacity: 0.8 }}>
              {t('howToUseText')}
            </Text>
          </View>
        </SettingSection>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={18} color={currentTheme.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: currentTheme.accent, fontFamily: currentTheme.font }]}>{t('themes')}</Text>
          </View>
          <View style={styles.themeGrid}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id} activeOpacity={0.8}
                style={[styles.themeBox, {
                  backgroundColor: theme.bg, borderColor: currentTheme.id === theme.id ? theme.accent : theme.secondary,
                  borderWidth: currentTheme.id === theme.id ? 2 : 1
                }]}
                onPress={() => setCurrentTheme(theme)}
              >
                <View style={[styles.colorPreview, { backgroundColor: theme.accent }]} />
                <Text style={[styles.themeName, { color: theme.text, fontFamily: theme.font }]} numberOfLines={1}>{theme.name}</Text>
                {currentTheme.id === theme.id && <View style={styles.activeBadge}><Ionicons name="checkmark-circle" size={18} color={theme.accent} /></View>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, paddingBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  scrollContent: { padding: 20 },
  sectionContainer: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingLeft: 5 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  sectionContent: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  label: { fontSize: 15 },
  counterContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  valueText: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  themeBox: { width: '30%', aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 5, position: 'relative' },
  colorPreview: { width: 24, height: 24, borderRadius: 12, marginBottom: 8 },
  themeName: { fontSize: 10, textAlign: 'center', fontWeight: 'bold' },
  activeBadge: { position: 'absolute', top: 5, right: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 340, maxHeight: '50%', borderRadius: 20, borderWidth: 1, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 }
});

export default SettingsScreen;