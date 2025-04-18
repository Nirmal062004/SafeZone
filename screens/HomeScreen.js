import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as SMS from 'expo-sms';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  // Fetch emergency contacts
  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const contactsRef = collection(db, 'users', user.uid, 'emergencyContacts');
      const snapshot = await getDocs(contactsRef);
      const contactsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSOSPress = async () => {
    try {
      setLoading(true);
      
      // Check if we have emergency contacts
      if (contacts.length === 0) {
        Alert.alert(
          'No Emergency Contacts',
          'Please add emergency contacts first.',
          [{ text: 'Add Contacts', onPress: () => navigation.navigate('EmergencyContacts') }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for SOS');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const message = `EMERGENCY SOS ALERT! I need help! My current location is: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      
      if (isAvailable) {
        // Send SMS to all emergency contacts
        const phoneNumbers = contacts.map(contact => contact.phoneNumber);
        await SMS.sendSMSAsync(phoneNumbers, message);
        Alert.alert('SOS Sent', 'Emergency message has been sent to your contacts');
      } else {
        // If SMS not available, try to share via other apps
        await Linking.openURL(`sms:${contacts[0].phoneNumber}?body=${encodeURIComponent(message)}`);
      }
    } catch (error) {
      console.error('Error in SOS function:', error);
      Alert.alert('Error', 'Failed to send SOS message');
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const message = `I'm sharing my location with you: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      // Share via any available app
      await Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not get location.');
    }
  };

  const handleFakeCall = () => {
    navigation.navigate('FakeCall');
  };

  const handleSafePlaces = () => {
    navigation.navigate('MapScreen');
  };

  const handleVoiceTrigger = () => {
    navigation.navigate('VoiceTrigger');
  };
  
  const handleEmergencyContacts = () => {
    navigation.navigate('EmergencyContacts');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SafeZone</Text>
        <Text style={styles.subtitle}>Your Safety Companion</Text>
        <TouchableOpacity 
          style={styles.contactsButton} 
          onPress={handleEmergencyContacts}
          activeOpacity={0.7}
        >
          <MaterialIcons name="contacts" size={24} color="#2e86de" />
          <Text style={styles.contactsButtonText}>Contacts</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.sosButton} 
        onPress={handleSOSPress}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <>
            <Text style={styles.sosIcon}>✱</Text>
            <Text style={styles.sosText}>TAP FOR SOS</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={handleShareLocation}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.cardText}>Share Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleFakeCall}>
          <Text style={styles.icon}>📞</Text>
          <Text style={styles.cardText}>Fake Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleSafePlaces}>
          <Text style={styles.icon}>🗺️</Text>
          <Text style={styles.cardText}>Safe Places</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleVoiceTrigger}>
          <Text style={styles.icon}>🎤</Text>
          <Text style={styles.cardText}>Voice Trigger</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9f8',
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  contactsButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  contactsButtonText: {
    color: '#2e86de',
    marginLeft: 4,
    fontWeight: '500',
  },
  sosButton: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 40,
  },
  sosIcon: {
    fontSize: 50,
    color: 'red',
    fontWeight: 'bold',
  },
  sosText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    width: 140,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;