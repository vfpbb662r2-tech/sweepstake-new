import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { APP_CONFIG, formatDate } from '@sweepstake/shared';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sweepstake App</Text>
      <Text style={styles.subtitle}>World Cup Sweepstakes</Text>
      <Text style={styles.date}>{formatDate(new Date())}</Text>
      <Text style={styles.info}>
        Max participants: {APP_CONFIG.MAX_SWEEPSTAKE_PARTICIPANTS}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#999',
  },
});