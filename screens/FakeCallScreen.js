import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Vibration,
  Platform,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';

const CALLER_NAMES = [
  'Mom',
  'Dad',
  'Partner',
  'Friend',
  'Boss',
  'Roommate',
];

const FakeCallScreen = ({ navigation }) => {
  const [callState, setCallState] = useState('incoming'); // incoming, active, ended
  const [timer, setTimer] = useState(0);
  const [callerName, setCallerName] = useState('');
  const [sound, setSound] = useState();

  useEffect(() => {
    // Set a random caller
    setCallerName(CALLER_NAMES[Math.floor(Math.random() * CALLER_NAMES.length)]);
    
    // Start vibration and ringtone
    startRinging();
    
    // Cleanup
    return () => {
      stopRinging();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callState === 'active') {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const startRinging = async () => {
    // Vibration pattern
    const vibrationPattern = [1000, 2000, 1000];
    Vibration.vibrate(vibrationPattern, true);
    
    // Play ringtone
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/ringtone.mp3')
      );
      setSound(sound);
      await sound.playAsync();
      await sound.setIsLoopingAsync(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const stopRinging = () => {
    Vibration.cancel();
    if (sound) {
      sound.stopAsync();
    }
  };

  const handleAnswer = () => {
    stopRinging();
    setCallState('active');
  };

  const handleDecline = () => {
    stopRinging();
    navigation.goBack();
  };

  const handleEndCall = () => {
    stopRinging();
    setCallState('ended');
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.callerInfoContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{callerName[0]}</Text>
        </View>
        <Text style={styles.callerName}>{callerName}</Text>
        
        {callState === 'incoming' && (
          <Text style={styles.callStatus}>Incoming call...</Text>
        )}
        
        {callState === 'active' && (
          <Text style={styles.callStatus}>{formatTime(timer)}</Text>
        )}
        
        {callState === 'ended' && (
          <Text style={styles.callStatus}>Call ended</Text>
        )}
      </View>

      <View style={styles.actionContainer}>
        {callState === 'incoming' ? (
          <>
            <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={handleDecline}>
              <Text style={styles.buttonIcon}>✕</Text>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.answerButton]} onPress={handleAnswer}>
              <Text style={styles.buttonIcon}>✓</Text>
              <Text style={styles.buttonText}>Answer</Text>
            </TouchableOpacity>
          </>
        ) : callState === 'active' ? (
          <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEndCall}>
            <Text style={styles.buttonIcon}>✕</Text>
            <Text style={styles.buttonText}>End Call</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
    padding: 20,
  },
  callerInfoContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    color: '#FFF',
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: 30,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 18,
    color: '#AAA',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 40,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  answerButton: {
    backgroundColor: '#4CD964',
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  buttonIcon: {
    fontSize: 30,
    color: '#FFF',
  },
  buttonText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 5,
  },
});

export default FakeCallScreen;