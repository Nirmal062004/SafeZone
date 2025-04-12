import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Function to request permission and get location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    // Get the current position of the user
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  // Function to watch the location continuously
  const watchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    // Watch position changes and update the state
    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000 },
      (newLocation) => {
        setLocation(newLocation);
      }
    );
  };

  // Get location on component mount and start watching it
  useEffect(() => {
    getLocation();
    watchLocation();  // Start watching location as well
  }, []);

  // If location is fetched, we render the map
  const renderMap = () => {
    if (!location) {
      return <Text>Loading...</Text>; // Show loading text until location is fetched
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
          body, html { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${location.coords.latitude}, ${location.coords.longitude}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          L.marker([${location.coords.latitude}, ${location.coords.longitude}]).addTo(map)
            .bindPopup("You are here").openPopup();
        </script>
      </body>
      </html>
    `;
    
    return <WebView originWhitelist={['*']} source={{ html }} />;
  };

  return (
    <View style={styles.container}>
      {renderMap()}
      {errorMsg && <Text>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
