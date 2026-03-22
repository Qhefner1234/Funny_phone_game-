import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function HomeScreen({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.inner}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>Funny Phone Game</Text>
        <Text style={styles.subtitle}>A Strategy Game for Ridiculous Rulers</Text>
        <Text style={styles.description}>
          You are a newly crowned ruler of a questionable kingdom.{'\n'}
          Make strategic decisions, survive 5 absurd scenarios,{'\n'}
          and try not to lose everything.
        </Text>

        <View style={styles.statsRow}>
          <Stat emoji="💰" label="Gold" />
          <Stat emoji="⚔️" label="Army" />
          <Stat emoji="😄" label="Happiness" />
          <Stat emoji="⭐" label="Reputation" />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Game')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>Begin Your Reign</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Stat({emoji, label}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0533',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  crown: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f5c842',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#c9a8e0',
    textAlign: 'center',
    marginBottom: 28,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#d8c8ec',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    backgroundColor: '#2d0d52',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#c9a8e0',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#f5c842',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#f5c842',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#1a0533',
    fontSize: 18,
    fontWeight: '800',
  },
});
