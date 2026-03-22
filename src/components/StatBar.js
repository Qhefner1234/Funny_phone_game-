import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function StatBar({emoji, label, value, max}) {
  const pct = (value / max) * 100;

  let barColor = '#4cff91';
  if (pct <= 30) barColor = '#ff5c5c';
  else if (pct <= 60) barColor = '#f5c842';

  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.barSection}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}/{max}</Text>
        </View>
        <View style={styles.barOuter}>
          <View
            style={[styles.barInner, {width: `${pct}%`, backgroundColor: barColor}]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  barSection: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#c9a8e0',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  barOuter: {
    height: 7,
    backgroundColor: '#1a0533',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: 4,
  },
});
