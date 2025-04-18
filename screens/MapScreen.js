import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const getLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(currentLocation);
      await fetchAllSafePlaces(currentLocation.coords.latitude, currentLocation.coords.longitude);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Failed to get your location. Please try again.');
      setLoading(false);
    }
  };

  const watchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const subscription = await Location.watchPositionAsync(
      { 
        accuracy: Location.Accuracy.High, 
        timeInterval: 5000,
        distanceInterval: 10
      },
      (newLocation) => {
        setLocation(newLocation);
      }
    );

    return subscription;
  };

  const fetchSafePlaces = async (lat, lon, query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}+near+${lat},${lon}&limit=15`
      );
      if (!response.ok) {
        throw new Error(`Error fetching ${query}: ${response.status}`);
      }
      const data = await response.json();
      return data.map(place => ({ ...place, type: query }));
    } catch (error) {
      console.error(`Error fetching ${query}:`, error);
      return [];
    }
  };

  const fetchAllSafePlaces = async (lat, lon) => {
    try {
      const [hospitals, police, pharmacies] = await Promise.all([
        fetchSafePlaces(lat, lon, 'hospital'),
        fetchSafePlaces(lat, lon, 'police station'),
        fetchSafePlaces(lat, lon, 'pharmacy')
      ]);
      setPlaces([...hospitals, ...police, ...pharmacies]);
    } catch (error) {
      console.error('Error fetching safe places:', error);
      setErrorMsg('Failed to load safe places. Please check your connection.');
    }
  };

  useEffect(() => {
    let locationSubscription;
    
    getLocation();
    
    (async () => {
      locationSubscription = await watchLocation();
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const filterPlaces = (category) => {
    setActiveCategory(category);
  };

  const renderMap = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e86de" />
          <Text style={styles.loadingText}>Loading map and safe places...</Text>
        </View>
      );
    }

    if (!location) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Unable to load your location.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Filter places based on active category
    const filteredPlaces = activeCategory === 'all' 
      ? places 
      : places.filter(place => place.type === activeCategory);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
          body, html { height: 100%; margin: 0; padding: 0; }
          .custom-marker { width: 30px; height: 30px; background-size: contain; }
          .pulse {
            display: block;
            border-radius: 50%;
            cursor: pointer;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(46, 134, 222, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(46, 134, 222, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(46, 134, 222, 0);
            }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${location.coords.latitude}, ${location.coords.longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Custom pulsing marker for user location
          var userIcon = L.divIcon({
            className: 'custom-marker pulse',
            html: '<div style="background-color: #2e86de; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white;"></div>',
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          });

          // Add user location marker
          var userMarker = L.marker([${location.coords.latitude}, ${location.coords.longitude}], {
            icon: userIcon,
            zIndexOffset: 1000
          })
          .addTo(map)
          .bindPopup("<strong>You are here</strong>")
          .openPopup();

          // Function to create custom icon based on place type
          function getIcon(type) {
            let color, label;
            
            switch(type) {
              case 'hospital':
                color = '#ff5252';
                label = '🏥';
                break;
              case 'police station':
                color = '#536dfe';
                label = '🚓';
                break;
              case 'pharmacy':
                color = '#4caf50';
                label = '💊';
                break;
              default:
                color = '#ff9800';
                label = '📍';
            }
            
            return L.divIcon({
              className: 'custom-marker',
              html: \`<div style="background-color: \${color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white;">\${label}</div>\`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });
          }

          // Add place markers
          const places = ${JSON.stringify(filteredPlaces)};
          places.forEach(place => {
            const placeIcon = getIcon(place.type);
            
            const label = place.type === 'hospital' ? '🏥 Hospital'
                        : place.type === 'police station' ? '🚓 Police Station'
                        : place.type === 'pharmacy' ? '💊 Pharmacy'
                        : '📍 Place';

            L.marker([parseFloat(place.lat), parseFloat(place.lon)], { icon: placeIcon })
              .addTo(map)
              .bindPopup("<strong>" + label + "</strong><br>" + (place.display_name || ''));
          });
          
          // Draw a circle around user's location (approx 100m radius)
          L.circle([${location.coords.latitude}, ${location.coords.longitude}], {
            radius: 100,
            color: '#2e86de',
            fillColor: '#2e86de',
            fillOpacity: 0.1
          }).addTo(map);
        </script>
      </body>
      </html>
    `;

    return <WebView originWhitelist={['*']} source={{ html }} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeCategory === 'all' && styles.activeFilter]}
          onPress={() => filterPlaces('all')}
        >
          <Text style={[styles.filterText, activeCategory === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeCategory === 'hospital' && styles.activeFilter]}
          onPress={() => filterPlaces('hospital')}
        >
          <Text style={[styles.filterText, activeCategory === 'hospital' && styles.activeFilterText]}>Hospitals</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeCategory === 'police station' && styles.activeFilter]}
          onPress={() => filterPlaces('police station')}
        >
          <Text style={[styles.filterText, activeCategory === 'police station' && styles.activeFilterText]}>Police</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeCategory === 'pharmacy' && styles.activeFilter]}
          onPress={() => filterPlaces('pharmacy')}
        >
          <Text style={[styles.filterText, activeCategory === 'pharmacy' && styles.activeFilterText]}>Pharmacy</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        {renderMap()}
        {errorMsg && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorOverlayText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.refreshButton} onPress={getLocation}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  mapContainer: {
    flex: 1,
    position: 'relative'
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f6fa'
  },
  activeFilter: {
    backgroundColor: '#2e86de'
  },
  filterText: {
    color: '#2c3e50',
    fontWeight: '500'
  },
  activeFilterText: {
    color: 'white'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa'
  },
  loadingText: {
    marginTop: 15,
    color: '#2c3e50',
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  error: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  errorOverlayText: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#2e86de',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2e86de',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});