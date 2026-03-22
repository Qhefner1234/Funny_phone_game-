import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import {
  INITIAL_STATE,
  applyEffects,
  getRandomScenarios,
  clamp,
  MAX_STAT,
} from '../utils/gameLogic';
import {TOTAL_ROUNDS} from '../data/scenarios';
import StatBar from '../components/StatBar';

export default function GameScreen({navigation}) {
  const [scenarios] = useState(() => getRandomScenarios(TOTAL_ROUNDS));
  const [round, setRound] = useState(0);
  const [stats, setStats] = useState(INITIAL_STATE);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const scenario = scenarios[round];

  function handleChoice(choice) {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);
    setShowOutcome(true);
  }

  function handleNext() {
    const newStats = applyEffects(stats, selectedChoice.effects);

    if (round + 1 >= TOTAL_ROUNDS) {
      navigation.replace('Results', {stats: newStats});
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStats(newStats);
      setRound(r => r + 1);
      setSelectedChoice(null);
      setShowOutcome(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }

  function formatEffect(val) {
    if (val > 0) return `+${val}`;
    return `${val}`;
  }

  function effectColor(val) {
    if (val > 0) return '#4cff91';
    if (val < 0) return '#ff5c5c';
    return '#aaa';
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.roundText}>
          Round {round + 1} / {TOTAL_ROUNDS}
        </Text>
        <View style={styles.statsCompact}>
          <MiniStat emoji="💰" val={stats.gold} />
          <MiniStat emoji="⚔️" val={stats.army} />
          <MiniStat emoji="😄" val={stats.happiness} />
          <MiniStat emoji="⭐" val={stats.reputation} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={{opacity: fadeAnim}}>
          {/* Stat bars */}
          <View style={styles.statBarsContainer}>
            <StatBar emoji="💰" label="Gold" value={stats.gold} max={MAX_STAT} />
            <StatBar emoji="⚔️" label="Army" value={stats.army} max={MAX_STAT} />
            <StatBar emoji="😄" label="Happiness" value={stats.happiness} max={MAX_STAT} />
            <StatBar emoji="⭐" label="Reputation" value={stats.reputation} max={MAX_STAT} />
          </View>

          {/* Scenario Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{scenario.title}</Text>
            <Text style={styles.cardSituation}>{scenario.situation}</Text>
          </View>

          {/* Choices */}
          {!showOutcome ? (
            <View style={styles.choicesContainer}>
              <Text style={styles.chooseLabel}>Choose your strategy:</Text>
              {scenario.choices.map((choice, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.choiceButton}
                  onPress={() => handleChoice(choice)}
                  activeOpacity={0.75}>
                  <Text style={styles.choiceText}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.outcomeContainer}>
              <Text style={styles.outcomeLabel}>What happened:</Text>
              <Text style={styles.outcomeText}>{selectedChoice.outcome}</Text>

              <View style={styles.effectsRow}>
                {[
                  {emoji: '💰', key: 'gold'},
                  {emoji: '⚔️', key: 'army'},
                  {emoji: '😄', key: 'happiness'},
                  {emoji: '⭐', key: 'reputation'},
                ].map(({emoji, key}) => {
                  const val = selectedChoice.effects[key];
                  if (val === 0) return null;
                  return (
                    <View key={key} style={styles.effectBadge}>
                      <Text style={styles.effectEmoji}>{emoji}</Text>
                      <Text
                        style={[
                          styles.effectValue,
                          {color: effectColor(val)},
                        ]}>
                        {formatEffect(val)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>
                  {round + 1 >= TOTAL_ROUNDS ? 'See Results 🏁' : 'Next Scenario →'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({emoji, val}) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniEmoji}>{emoji}</Text>
      <Text style={styles.miniVal}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0533',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d0d52',
  },
  roundText: {
    color: '#f5c842',
    fontWeight: '700',
    fontSize: 15,
  },
  statsCompact: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniEmoji: {
    fontSize: 14,
  },
  miniVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statBarsContainer: {
    backgroundColor: '#2d0d52',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  card: {
    backgroundColor: '#2d0d52',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f5c842',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f5c842',
    marginBottom: 10,
  },
  cardSituation: {
    fontSize: 15,
    color: '#e0d0f5',
    lineHeight: 24,
  },
  choicesContainer: {
    gap: 12,
  },
  chooseLabel: {
    color: '#c9a8e0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  choiceButton: {
    backgroundColor: '#3d1566',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6b2eb0',
  },
  choiceText: {
    color: '#f0e0ff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  outcomeContainer: {
    backgroundColor: '#2d0d52',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4cff91',
  },
  outcomeLabel: {
    color: '#4cff91',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  outcomeText: {
    color: '#e0d0f5',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  effectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  effectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a0533',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  effectEmoji: {
    fontSize: 16,
  },
  effectValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  nextButton: {
    backgroundColor: '#f5c842',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#1a0533',
    fontSize: 16,
    fontWeight: '800',
  },
});
