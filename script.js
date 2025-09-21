async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();
    
    if (!cityName) {
        showError('Please enter a city name!');
        return;
    }
    
    showLoading();
    hideError();
    hideWeatherInfo();
    
    try {
        // First, get coordinates for the city
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found! Please try a different city name.');
        }
        
        const city = geoData.results[0];
        const lat = city.latitude;
        const lon = city.longitude;
        const fullCityName = city.name + (city.country ? ', ' + city.country : '');
        
        // Get weather data
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.current) {
            throw new Error('Weather data not available for this location.');
        }
        
        // Display weather
        displayWeather(fullCityName, weatherData.current);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayWeather(cityName, current) {
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
    document.getElementById('feelsLike').textContent = Math.round(current.apparent_temperature);
    document.getElementById('humidity').textContent = current.relative_humidity_2m;
    document.getElementById('windSpeed').textContent = current.wind_speed_10m;
    document.getElementById('weatherDescription').textContent = getWeatherDescription(current.weather_code);
    
    document.getElementById('weatherInfo').style.display = 'block';
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    
    return weatherCodes[code] || 'Unknown weather';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    document.getElementById('error').textContent = message;
    document.getElementById('error').style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function hideWeatherInfo() {
    document.getElementById('weatherInfo').style.display = 'none';
}

// Allow Enter key to search
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});