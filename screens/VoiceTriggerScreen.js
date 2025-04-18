import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';

const VoiceTriggerScreen = ({ navigation, route }) => {
  const [isTriggerEnabled, setIsTriggerEnabled] = useState(false); // Master toggle
  const [isListening, setIsListening] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [triggerWords, setTriggerWords] = useState(['help', 'emergency', 'sos']);
  const [recording, setRecording] = useState(null);
  const [instructions, setInstructions] = useState('Set up voice triggers that will activate the SOS alert when you say them.');
  const [processingAudio, setProcessingAudio] = useState(false);
  const [newTriggerWord, setNewTriggerWord] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(null);
  const isFocused = useIsFocused();
  const recognitionInterval = useRef(null);

  // Load emergency contact from route params or storage
  useEffect(() => {
    if (route.params?.emergencyContact) {
      setEmergencyContact(route.params.emergencyContact);
    } 
    // No default contact is set
  }, [route.params]);

  // Clean up recording when leaving screen
  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
      if (recognitionInterval.current) {
        clearInterval(recognitionInterval.current);
      }
    };
  }, [recording]);

  // Reset listening state when screen is not focused
  useEffect(() => {
    if (!isFocused && isListening) {
      setIsListening(false);
      stopRecording();
    }
  }, [isFocused]);

  // Stop listening when master toggle is turned off
  useEffect(() => {
    if (!isTriggerEnabled && isListening) {
      setIsListening(false);
      stopRecording();
    }
  }, [isTriggerEnabled]);

  const startRecording = async () => {
    try {
      // Check if emergency contact is set before starting
      if (!emergencyContact) {
        Alert.alert(
          'No Emergency Contact',
          'Please set an emergency contact before enabling voice trigger.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Set Contact', onPress: () => navigateToContacts() }
          ]
        );
        return;
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone permission is required for voice trigger');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setInstructions('Listening for voice triggers...');

      // Set up periodic checking for voice recognition
      startVoiceRecognition();
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const stopRecording = async () => {
    if (recognitionInterval.current) {
      clearInterval(recognitionInterval.current);
      recognitionInterval.current = null;
    }
    
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setInstructions('Voice trigger is turned off');
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
      setRecording(null);
    }
  };

  const startVoiceRecognition = () => {
    // Check every 5 seconds by stopping the recording, analyzing it, and starting a new one
    recognitionInterval.current = setInterval(async () => {
      if (!recording) return;
      
      try {
        setProcessingAudio(true);
        // Stop current recording
        const uri = recording.getURI();
        await recording.stopAndUnloadAsync();
        
        // Process the audio (in a real app, send to a speech-to-text API)
        await processAudioForTriggerWords(uri);
        
        // Restart recording if still listening
        if (isListening && isTriggerEnabled) {
          const newRecording = new Audio.Recording();
          await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
          await newRecording.startAsync();
          setRecording(newRecording);
        }
        setProcessingAudio(false);
      } catch (error) {
        console.error('Error in voice recognition cycle:', error);
        setProcessingAudio(false);
      }
    }, 5000);
  };

  // This simulates processing the audio for trigger words
  // In a real app, you'd use a speech-to-text API like Google Speech-to-Text
  const processAudioForTriggerWords = async (audioUri) => {
    // Here we would upload the audio file to a speech-to-text service
    // For demonstration, we'll simulate detecting a trigger word with randomness
    
    console.log('Processing audio file:', audioUri);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes: 
    // 1. Randomly decide if we detected speech
    // 2. If detected, randomly select one of the trigger words to simulate recognition
    const speechDetected = Math.random() > 0.7;
    
    if (speechDetected) {
      const randomIndex = Math.floor(Math.random() * triggerWords.length);
      const detectedWord = triggerWords[randomIndex];
      console.log('Detected word:', detectedWord);
      
      // If the detected word is in our trigger words list, trigger the SOS
      if (triggerWords.includes(detectedWord.toLowerCase())) {
        triggerSOS();
        return true;
      }
    }
    
    return false;
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const triggerSOS = async () => {
    // Stop listening
    setIsListening(false);
    await stopRecording();
    
    // Get current location
    const location = await getCurrentLocation();
    const locationText = location 
      ? `My current location: https://maps.google.com/maps?q=${location.latitude},${location.longitude}` 
      : 'Unable to share my location';
    
    // Prepare emergency message
    const sosMessage = `I'm in danger, I need help! ${locationText}`;
    
    // In a real app, you would send an SMS or make a call
    // For this demo, we'll show an alert with the message that would be sent
    Speech.speak('SOS triggered! Sending emergency alert.');
    
    Alert.alert(
      'SOS Alert Activated',
      `Emergency message "${sosMessage}" would be sent to ${emergencyContact.name} (${emergencyContact.phone})`,
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  };

  const toggleListening = async (value) => {
    if (!isTriggerEnabled) return;
    
    if (value) {
      setIsListening(true);
      startRecording();
    } else {
      setIsListening(false);
      stopRecording();
    }
  };

  const toggleTriggerFeature = (value) => {
    setIsTriggerEnabled(value);
    if (!value && isListening) {
      setIsListening(false);
      stopRecording();
    }
  };

  const handleSetup = () => {
    // Check if emergency contact is set
    if (!emergencyContact) {
      Alert.alert(
        'Emergency Contact Required',
        'You need to set an emergency contact before setting up voice triggers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Contact', onPress: () => navigateToContacts() }
        ]
      );
      return;
    }

    Alert.alert(
      'Voice Trigger Setup',
      'This feature will recognize emergency keywords. Would you like to use the default trigger words or add your own?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Default', 
          onPress: () => {
            setIsSetup(true);
            Alert.alert('Setup Complete', 'Voice trigger is ready to use with default keywords.');
          }
        },
        {
          text: 'Add My Own',
          onPress: () => setIsSetup(true) // This will show the input field
        }
      ]
    );
  };

  const navigateToContacts = () => {
    navigation.navigate('EmergencyContacts', { 
      onSelect: (contact) => {
        navigation.navigate('VoiceTrigger', { emergencyContact: contact });
      }
    });
  };

  const addTriggerWord = () => {
    if (newTriggerWord.trim().length === 0) return;
    
    const word = newTriggerWord.trim().toLowerCase();
    if (!triggerWords.includes(word)) {
      setTriggerWords([...triggerWords, word]);
    }
    setNewTriggerWord('');
  };

  const removeTriggerWord = (wordToRemove) => {
    setTriggerWords(triggerWords.filter(word => word !== wordToRemove));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Trigger</Text>
      
      {/* Master Toggle for the entire Voice Trigger feature */}
      <View style={styles.masterToggleContainer}>
        <Text style={styles.masterToggleLabel}>Voice Trigger Feature</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#4CD964" }}
          thumbColor={isTriggerEnabled ? "#fff" : "#f4f3f4"}
          onValueChange={toggleTriggerFeature}
          value={isTriggerEnabled}
        />
      </View>
      
      {isTriggerEnabled ? (
        <View style={styles.card}>
          <Text style={styles.instructions}>{instructions}</Text>
          
          {/* Emergency Contact Selection Section */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            {emergencyContact ? (
              <View style={styles.selectedContactContainer}>
                <Text style={styles.contactInfo}>{emergencyContact.name} ({emergencyContact.phone})</Text>
                <TouchableOpacity 
                  style={styles.changeContactButton}
                  onPress={navigateToContacts}
                >
                  <Text style={styles.changeContactText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.setContactButton}
                onPress={navigateToContacts}
              >
                <Text style={styles.setContactText}>Set Emergency Contact</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {!isSetup ? (
            <TouchableOpacity 
              style={[styles.setupButton, !emergencyContact && styles.disabledButton]} 
              onPress={handleSetup}
              disabled={!emergencyContact}
            >
              <Text style={styles.setupButtonText}>
                {emergencyContact ? 'Set Up Voice Trigger' : 'Set Contact First'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Enable Listening</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#4CD964" }}
                  thumbColor={isListening ? "#fff" : "#f4f3f4"}
                  onValueChange={toggleListening}
                  value={isListening}
                  disabled={processingAudio || !emergencyContact}
                />
              </View>
              
              {isListening && (
                <View style={styles.listeningIndicator}>
                  <ActivityIndicator size="large" color="#4CD964" />
                  <Text style={styles.listeningText}>
                    {processingAudio ? 'Processing speech...' : 'Listening...'}
                  </Text>
                </View>
              )}
              
              <View style={styles.triggerWordsContainer}>
                <Text style={styles.triggerWordsTitle}>Active Trigger Words:</Text>
                <View style={styles.badgeContainer}>
                  {triggerWords.map((word, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.triggerWordBadge}
                      onLongPress={() => removeTriggerWord(word)}
                    >
                      <Text style={styles.triggerWordText}>{word}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.addWordContainer}>
                  <TextInput
                    style={styles.wordInput}
                    value={newTriggerWord}
                    onChangeText={setNewTriggerWord}
                    placeholder="Add new trigger word"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    style={styles.addWordButton}
                    onPress={addTriggerWord}
                  >
                    <Text style={styles.addWordButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.featureDisabledContainer}>
          <Text style={styles.featureDisabledText}>
            Voice trigger is currently disabled. Turn on the switch above to enable this feature.
          </Text>
          <Text style={styles.featureDescription}>
            When enabled, this feature allows the app to listen for specific trigger words that will automatically send an emergency alert with your location if you're in danger.
          </Text>
        </View>
      )}
      
      <Text style={styles.disclaimer}>
        Note: Long press on a trigger word to remove it. In a real emergency, please call your local emergency number directly.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f9f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  masterToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  masterToggleLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  featureDisabledContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  featureDisabledText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 15,
  },
  featureDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  selectedContactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    fontSize: 15,
    color: '#333',
  },
  changeContactButton: {
    backgroundColor: '#2e86de',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeContactText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  setContactButton: {
    backgroundColor: '#2e86de',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  setContactText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  setupButton: {
    backgroundColor: '#2e86de',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b0c4de',
  },
  setupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  listeningIndicator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  listeningText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CD964',
    fontWeight: '500',
  },
  triggerWordsContainer: {
    marginTop: 20,
  },
  triggerWordsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  triggerWordBadge: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  triggerWordText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  addWordContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  wordInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addWordButton: {
    backgroundColor: '#2e86de',
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWordButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VoiceTriggerScreen;