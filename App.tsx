import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

// Logs every keyboard notification the platform sends. On iOS 26+ a rotation
// produces a show notification with height 0 and no matching hide.
const useKeyboardEventLog = () => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const record = (name: string) => (e: any) =>
      setLog((entries) =>
        [...entries, `${name} height=${e?.endCoordinates?.height}`].slice(-6)
      );

    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', record('willShow')),
      Keyboard.addListener('keyboardDidShow', record('didShow')),
      Keyboard.addListener('keyboardWillHide', record('willHide')),
      Keyboard.addListener('keyboardDidHide', record('didHide')),
    ];

    return () => subscriptions.forEach((s) => s.remove());
  }, []);

  return log;
};

const Screen = ({ name }: { name: string }) => {
  const log = useKeyboardEventLog();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.hint}>Rotate the device. The tab bar below disappears.</Text>
      <Text style={styles.logTitle}>Keyboard notifications</Text>
      {log.length === 0 ? <Text style={styles.log}>none yet</Text> : null}
      {log.map((entry, index) => (
        <Text key={index} style={styles.log}>
          {entry}
        </Text>
      ))}
    </View>
  );
};

const HomeScreen = () => <Screen name="Home" />;
const SettingsScreen = () => <Screen name="Settings" />;

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarHideOnKeyboard: true }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 8 },
  hint: { fontSize: 15, textAlign: 'center', marginBottom: 24 },
  logTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  log: { fontSize: 13, fontVariant: ['tabular-nums'] },
});
