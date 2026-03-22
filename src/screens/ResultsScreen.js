import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {calculateScore, getRating, MAX_STAT} from '../utils/gameLogic';
import StatBar from '../components/StatBar';

export default function ResultsScreen({route, navigation}) {
  const {stats} = route.params;
  const score = calculateScore(stats);
  const rating = getRating(score);
  const maxScore = MAX_STAT * 4;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.trophy}>{rating.emoji}</Text>
        <Text style={styles.ratingLabel}>Your reign ends as a…</Text>
        <Text style={styles.ratingTitle}>{rating.label}</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Final Score</Text>
          <Text style={styles.scoreValue}>
            {score} / {maxScore}
          </Text>
          <View style={styles.scoreBarOuter}>
            <View
              style={[
                styles.scoreBarInner,
                {width: `${(score / maxScore) * 100}%`},
              ]}
            />
          </View>
        </View>

        <View style={styles.statBarsContainer}>
          <Text style={styles.sectionTitle}>Final Kingdom Stats</Text>
          <StatBar emoji="💰" label="Gold" value={stats.gold} max={MAX_STAT} />
          <StatBar emoji="⚔️" label="Army" value={stats.army} max={MAX_STAT} />
          <StatBar emoji="😄" label="Happiness" value={stats.happiness} max={MAX_STAT} />
          <StatBar emoji="⭐" label="Reputation" value={stats.reputation} max={MAX_STAT} />
        </View>

        <Text style={styles.funFact}>{getFunFact(rating.label)}</Text>

        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => navigation.replace('Game')}
          activeOpacity={0.8}>
          <Text style={styles.playAgainText}>Play Again 🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.replace('Home')}
          activeOpacity={0.8}>
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getFunFact(rating) {
  const facts = {
    'Supreme Overlord':
      'Historians will write songs about your reign. Most of them will be embarrassingly complimentary.',
    'Competent Ruler':
      'Your subjects respect you, mostly because you remembered their names. Most of them.',
    'Mediocre Monarch':
      'Your kingdom survived. Not thrived. But survived. That counts for something.',
    'Questionable Leader':
      'Future rulers will study your decisions as cautionary examples. You are officially a case study.',
    'Legendary Disaster':
      'Congratulations! You have achieved historical infamy. The bards will never let this go.',
  };
  return facts[rating] || 'Your legacy is… complicated.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0533',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  trophy: {
    fontSize: 80,
    marginBottom: 12,
    marginTop: 24,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#c9a8e0',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  ratingTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#f5c842',
    textAlign: 'center',
    marginBottom: 28,
  },
  scoreBox: {
    width: '100%',
    backgroundColor: '#2d0d52',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#c9a8e0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  scoreBarOuter: {
    width: '100%',
    height: 10,
    backgroundColor: '#1a0533',
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreBarInner: {
    height: '100%',
    backgroundColor: '#f5c842',
    borderRadius: 5,
  },
  statBarsContainer: {
    width: '100%',
    backgroundColor: '#2d0d52',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#c9a8e0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 8,
  },
  funFact: {
    fontSize: 14,
    color: '#d8c8ec',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  playAgainButton: {
    backgroundColor: '#f5c842',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    shadowColor: '#f5c842',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  playAgainText: {
    color: '#1a0533',
    fontSize: 17,
    fontWeight: '800',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  homeText: {
    color: '#c9a8e0',
    fontSize: 15,
    fontWeight: '600',
  },
});
