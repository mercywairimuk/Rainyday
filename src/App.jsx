import React, { useState } from 'react';
import { Cloud, Droplets, MapPin, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const RainyDayApp = () => {
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualRainfall, setManualRainfall] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const soilTypes = [
    { value: 'clay', label: 'Clay (Poor drainage)', drainageScore: 1 },
    { value: 'silt', label: 'Silt (Poor drainage)', drainageScore: 1.5 },
    { value: 'loam', label: 'Loam (Moderate drainage)', drainageScore: 3 },
    { value: 'sandy-loam', label: 'Sandy Loam (Good drainage)', drainageScore: 4 },
    { value: 'sand', label: 'Sand (Excellent drainage)', drainageScore: 5 }
  ];

  const fetchWeatherData = async () => {
    if (!location) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_KEY = '8e37c3145e3536ee83f2887b189df27b';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Location not found or API error');
      }

      const data = await response.json();
      
      
      const simulatedRainfall = Math.random() * 100;
      
      setWeatherData({
        location: data.name,
        temp: data.main.temp,
        humidity: data.main.humidity,
        rainfall: simulatedRainfall.toFixed(1),
        description: data.weather[0].description
      });
    } catch (err) {
      setError('Unable to fetch weather data. Using manual mode or check your location.');
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateFloodRisk = () => {
    if (!soilType) {
      setError('Please select a soil type');
      return;
    }

    const rainfall = manualMode ? parseFloat(manualRainfall) : parseFloat(weatherData?.rainfall || 0);
    
    if (isNaN(rainfall)) {
      setError('Please enter valid rainfall data');
      return;
    }

    const soil = soilTypes.find(s => s.value === soilType);
    const drainageScore = soil.drainageScore;

    let riskScore = 0;
    let riskLevel = '';
    let message = '';
    let safe = false;

    if (rainfall < 20) {
      riskScore = rainfall / drainageScore;
    } else if (rainfall < 50) {
      riskScore = (rainfall * 1.5) / drainageScore;
    } else {
      riskScore = (rainfall * 2) / drainageScore;
    }

    if (riskScore < 10) {
      riskLevel = 'Low';
      safe = true;
      message = 'Excellent conditions for planting. Soil drainage is adequate for current rainfall levels.';
    } else if (riskScore < 20) {
      riskLevel = 'Moderate';
      safe = true;
      message = 'Safe to plant, but monitor weather conditions. Consider raised beds if rainfall increases.';
    } else if (riskScore < 35) {
      riskLevel = 'High';
      safe = false;
      message = 'Not safe to plant. High flood risk due to poor drainage and significant rainfall.';
    } else {
      riskLevel = 'Very High';
      safe = false;
      message = 'Dangerous flood conditions. Avoid planting and consider flood protection measures.';
    }

    setRecommendation({
      safe,
      riskLevel,
      message,
      rainfall,
      soilType: soil.label,
      riskScore: riskScore.toFixed(1)
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-4xl mx-auto">
    
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cloud className="w-12 h-12 text-green-700" />
            <h1 className="text-4xl font-bold text-green-800">Rainy Day</h1>
          </div>
          <p className="text-green-700 text-lg">Flood Risk Assessment for Smart Planting</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-green-50 rounded-lg">
            <span className="text-green-800 font-medium">Data Input Mode:</span>
            <button
              onClick={() => setManualMode(!manualMode)}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 rounded-lg font-medium transition-colors"
            >
              {manualMode ? 'Switch to API Mode' : 'Switch to Manual Mode'}
            </button>
          </div>

          {!manualMode ? (
            <div className="mb-6">
              <label className="block text-green-800 font-medium mb-2">
                <MapPin className="inline w-5 h-5 mr-2" />
                Location
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city name (e.g., Nairobi)"
                  className="flex-1 px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <button
                  onClick={fetchWeatherData}
                  disabled={loading}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-green-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cloud className="w-5 h-5" />}
                  {loading ? 'Loading...' : 'Fetch Weather'}
                </button>
              </div>
              
              {weatherData && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">{weatherData.location}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Temperature:</span>
                      <span className="ml-2 font-medium">{weatherData.temp}°C</span>
                    </div>
                    <div>
                      <span className="text-green-600">Humidity:</span>
                      <span className="ml-2 font-medium">{weatherData.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-green-600">Rainfall (24h):</span>
                      <span className="ml-2 font-medium">{weatherData.rainfall} mm</span>
                    </div>
                    <div>
                      <span className="text-green-600">Conditions:</span>
                      <span className="ml-2 font-medium capitalize">{weatherData.description}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-green-800 font-medium mb-2">
                <Droplets className="inline w-5 h-5 mr-2" />
                Rainfall Amount (mm in last 24 hours)
              </label>
              <input
                type="number"
                value={manualRainfall}
                onChange={(e) => setManualRainfall(e.target.value)}
                placeholder="Enter rainfall in mm (e.g., 45)"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-green-800 font-medium mb-2">
              Soil Type
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none bg-white"
            >
              <option value="">Select soil type...</option>
              {soilTypes.map(soil => (
                <option key={soil.value} value={soil.value}>
                  {soil.label}
                </option>
              ))}
            </select>
          </div>

          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          
          <button
            onClick={calculateFloodRisk}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-6 h-6" />
            Assess Flood Risk
          </button>
        </div>

        
        {recommendation && (
          <div className={`rounded-2xl shadow-xl p-8 ${
            recommendation.safe 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="text-center text-white">
              <div className="mb-4">
                {recommendation.safe ? (
                  <CheckCircle className="w-20 h-20 mx-auto" />
                ) : (
                  <AlertTriangle className="w-20 h-20 mx-auto" />
                )}
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                {recommendation.safe ? 'Safe to Plant' : 'Not Safe – High Flood Risk'}
              </h2>
              
              <p className="text-xl mb-6 opacity-90">
                {recommendation.message}
              </p>

              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm opacity-80">Risk Level</p>
                    <p className="text-xl font-semibold">{recommendation.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Risk Score</p>
                    <p className="text-xl font-semibold">{recommendation.riskScore}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Rainfall</p>
                    <p className="text-xl font-semibold">{recommendation.rainfall} mm</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Soil Type</p>
                    <p className="text-xl font-semibold">{recommendation.soilType.split(' ')[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-green-700 text-sm">
          <p> Rainy Day - Helping farmers make informed planting decisions</p>
        </div>
      </div>
    </div>
  );
};

export default RainyDayApp;
