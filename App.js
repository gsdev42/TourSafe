// App.js
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Tflite from 'react-native-tensorflow-lite';
import TestModelApp from './TestModelApp';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <TestModelApp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});