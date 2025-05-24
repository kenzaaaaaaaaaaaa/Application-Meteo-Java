import axios from 'axios';
import * as Location from 'expo-location';
import moment from 'moment';
import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';

const API_KEY = 'e92d597d95d0beff0e8359e2adb46e5b'; // Remplacez par votre clé API OpenWeatherMap

const weatherBackgrounds = {
  Clear: require('./assets/soleil.jpg'),
  Rain: require('./assets/pluie.jpg'),
  Snow: require('./assets/neige.jpg'),
  Clouds: require('./assets/nuageux.jpg'),
  Drizzle: require('./assets/pluie.jpg'),
  Thunderstorm: require('./assets/orageux.jpg'),
  
};

const weatherIcons = {
  Clear: require('./assets/sun.png'),
  Rain: require('./assets/rain.png'),
  Snow: require('./assets/snow.png'),
  Clouds: require('./assets/clouds.png'),
  Drizzle: require('./assets/rain.png'),
  Thunderstorm: require('./assets/thunder.png'),
  Mist: require('./assets/clouds.png'),
};


export default function App() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [todayHourly, setTodayHourly] = useState([]);

  



  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchWeatherByCoords(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
      );
      setWeather(weatherResponse.data);
      setCity(weatherResponse.data.name);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const dailyData = forecastResponse.data.list.filter(reading => reading.dt_txt.includes("12:00:00"));
      setForecast(dailyData);

        
      // 🔽 Ajoute ceci pour les horaires d'aujourd'hui :
          const today = moment().format('YYYY-MM-DD');
          const hourlyToday = forecastResponse.data.list.filter(item => item.dt_txt.startsWith(today));
          setTodayHourly(hourlyToday);


      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${API_KEY}&units=metric&lang=fr`
      );
      setWeather(weatherResponse.data);
      setCity(weatherResponse.data.name);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const dailyData = forecastResponse.data.list.filter(reading => reading.dt_txt.includes("12:00:00"));
      setForecast(dailyData);
      

     // 🔽 Ajoute ceci pour les horaires d'aujourd'hui :
       const today = moment().format('YYYY-MM-DD');
       const hourlyToday = forecastResponse.data.list.filter(item => item.dt_txt.startsWith(today));
       setTodayHourly(hourlyToday);





      setLoading(false);
      setSearch('');
      Keyboard.dismiss();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const weatherMain = weather?.weather[0]?.main;
  const backgroundImage = weatherBackgrounds[weatherMain] || weatherBackgrounds['Clear'];
  const weatherIcon = weatherIcons[weatherMain] || weatherIcons['Clear'];

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une ville"
          placeholderTextColor="#fff"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchWeatherByCity}
        />

        
        <Text style={styles.cityName}>{city}</Text>
       
        <Text style={styles.date}>Actuellement</Text>
        
        <Image source={weatherIcon} style={styles.icon} />
        <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
        <Text style={styles.description}>{weather.weather[0].description}</Text>


        <Text style={styles.forecastTitle}>Prévisions par heure</Text>
        <FlatList
           data={todayHourly}
           keyExtractor={(item) => item.dt.toString()}
           horizontal
           renderItem={({ item }) => (
    <View style={styles.forecastItem}>
      <Text style={styles.forecastDate}>{moment(item.dt_txt).format('HH:mm')}</Text>
      <Image
        source={weatherIcons[item.weather[0].main] || weatherIcons['Clear']}
        style={styles.forecastIcon}
      />
      <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
    </View>
  )}
/>


         <Text style= {styles.forecastTitle}>Prévisions sur 5 jours</Text>
        <FlatList

          data={forecast}
          keyExtractor={(item) => item.dt.toString()}
          horizontal
          renderItem={({ item }) => (

            <View style={styles.forecastItem}>
              

              <Text style={styles.forecastDate}>{moment(item.dt_txt).format('ddd')}</Text>
              <Image
                source={weatherIcons[item.weather[0].main] || weatherIcons['Clear']}
                style={styles.forecastIcon}
              />
              <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    paddingTop: 60,
  },
  searchInput: {
    height: 40,
    width: '90%',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#fff',
    marginBottom: 20,
  },
   forecastTitle:{
      width: '90%',
     borderWidth: 1,           // Épaisseur de la bordure
    borderColor: 'transparent',      // Couleur de la bordure
    padding: 10,              // Espace intérieur
    borderRadius: 8,          // Coins arrondis (optionnel)
    textAlign: 'center',      // Centre le texte
    color: '#fff',            // Couleur du texte
    fontSize: 18,             // Taille du texte
    marginBottom: 10,         // Espace en dessous du titre
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
     
   },


  cityName: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textAlign:'left',
    marginBottom: 10,

  },
  date: {
    fontSize: 25,
    color: '#fff',
    marginBottom: 10,
     
  },
  time: {
    
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    
  },
  icon: {
    width: 100,
    height: 100,
    justifyContent: 'flex-end', 
  


  },
  temp: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
    
  },
  description: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 10,

  },
  forecastItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  forecastDate: {
    color: '#fff',
    fontSize: 16,
  },
  forecastIcon: {
    width: 45,
    height: 45,
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
     
  
  },
});