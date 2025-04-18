import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, updateDoc, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

const EmergencyContacts = ({ navigation, route }) => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentContactId, setCurrentContactId] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // Check if we're selecting a contact for the voice trigger feature
  const isSelectionMode = route.params?.onSelect !== undefined;

  const maxContacts = 10; // Updated from 5 to 10

  useEffect(() => {
    if (!user) return;

    const contactsRef = collection(db, 'users', user.uid, 'emergencyContacts');
    const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
      const contactList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactList);
    });

    return () => unsubscribe();
  }, [user]);

  const validatePhoneNumber = (number) => {
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(number);
  };

  const isDuplicate = (number, contactId = null) => {
    return contacts.some(contact => 
      contact.phoneNumber === number && contact.id !== contactId
    );
  };

  const saveContact = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      setError('Name and phone number are required.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (isDuplicate(phoneNumber, editMode ? currentContactId : null)) {
      setError('This phone number is already in your emergency contacts.');
      return;
    }

    if (!editMode && contacts.length >= maxContacts) {
      setError(`You can only add up to ${maxContacts} emergency contacts.`);
      return;
    }

    try {
      let savedContactId;
      
      if (editMode && currentContactId) {
        // Update existing contact
        await updateDoc(doc(db, 'users', user.uid, 'emergencyContacts', currentContactId), {
          name,
          phoneNumber
        });
        savedContactId = currentContactId;
      } else {
        // Add new contact
        const docRef = await addDoc(collection(db, 'users', user.uid, 'emergencyContacts'), {
          name,
          phoneNumber
        });
        savedContactId = docRef.id;
      }
      
      // If in selection mode, select this contact and return
      if (isSelectionMode && route.params.onSelect) {
        selectContact({ id: savedContactId, name, phoneNumber });
      }
      
      setName('');
      setPhoneNumber('');
      setError('');
      setEditMode(false);
      setCurrentContactId(null);
    } catch (error) {
      console.error('Error saving contact: ', error);
      setError('Failed to save contact. Please try again.');
    }
  };

  const editContact = (contact) => {
    setName(contact.name);
    setPhoneNumber(contact.phoneNumber);
    setEditMode(true);
    setCurrentContactId(contact.id);
  };

  const cancelEdit = () => {
    setName('');
    setPhoneNumber('');
    setEditMode(false);
    setCurrentContactId(null);
    setError('');
  };

  const removeContact = (contactId) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'emergencyContacts', contactId));
              // If removing the contact we're currently editing
              if (currentContactId === contactId) {
                cancelEdit();
              }
            } catch (error) {
              console.error('Error removing contact: ', error);
            }
          }
        }
      ]
    );
  };

  const selectContact = (contact) => {
    if (route.params?.onSelect) {
      route.params.onSelect({ 
        id: contact.id,
        name: contact.name, 
        phone: contact.phoneNumber 
      });
      navigation.goBack();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.contactCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
      </View>
      <View style={styles.contactActions}>
        {isSelectionMode ? (
          <TouchableOpacity 
            onPress={() => selectContact(item)} 
            style={styles.selectButton}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={() => editContact(item)} style={styles.editButton}>
              <MaterialIcons name="edit" size={20} color="#2e86de" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeContact(item.id)} style={styles.deleteButton}>
              <MaterialIcons name="delete" size={20} color="red" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {isSelectionMode ? 'Select Emergency Contact' : 'Emergency Contacts'}
      </Text>
      
      {isSelectionMode ? (
        <Text style={styles.subheading}>
          Select a contact to use with voice trigger feature
        </Text>
      ) : (
        <Text style={styles.subheading}>Add up to {maxContacts} emergency contacts</Text>
      )}

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          {editMode && (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.saveButton, editMode ? styles.editSaveButton : null]} 
            onPress={saveContact}
          >
            <Text style={styles.saveButtonText}>
              {editMode ? 'Update Contact' : isSelectionMode ? 'Save & Select' : 'Add Contact'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactsContainer}>
        <Text style={styles.contactsHeading}>
          {isSelectionMode ? 'Available Contacts' : `Your Contacts (${contacts.length}/${maxContacts})`}
        </Text>
        
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noContacts}>No emergency contacts added yet.</Text>}
          style={styles.contactsList}
        />
      </View>
    </View>
  );
};

export default EmergencyContacts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2e866e',
    borderRadius: 10,
    backgroundColor: '#2e86de',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  editSaveButton: {
    backgroundColor: '#f39c12',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  contactsContainer: {
    flex: 1,
  },
  contactsHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  contactsList: {
    marginTop: 10,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 8,
    marginLeft: 10,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  noContacts: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});