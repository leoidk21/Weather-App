import React, { useState, useEffect } from 'react';
import weatherLogo from '../assets/images/logo.svg';
import sunny from '../assets/images/icon-sunny.webp';
import rainy from '../assets/images/icon-rain.webp';
import drizzle from '../assets/images/icon-drizzle.webp';
import partlyCloudy from '../assets/images/icon-partly-cloudy.webp';
import storm from '../assets/images/icon-storm.webp';
import snow from '../assets/images/icon-snow.webp';
import foggy from '../assets/images/icon-fog.webp';
import overcast from '../assets/images/icon-overcast.webp';
import bgLarge from '../assets/images/bg-today-large.svg';

import checkMark from '../assets/images/icon-checkmark.svg';
import dropdown from '../assets/images/icon-dropdown.svg';
import loadingIcon from '../assets/images/icon-loading.svg';
import unitIcon from '../assets/images/icon-units.svg';
import logoIcon from '../assets/images/logo.svg';
import searchIcon from '../assets/images/icon-search.svg';
import errorIcon from '../assets/images/icon-error.svg';
import retryIcon from '../assets/images/icon-retry.svg';

const WEATHER_ICONS = {
    0: sunny,
    1: partlyCloudy, 
    2: partlyCloudy, 
    3: overcast,
    
    45: foggy, 
    48: foggy,
    
    51: drizzle, 
    53: drizzle, 
    55: drizzle,
    56: drizzle, 
    57: drizzle,
    
    61: rainy,
    63: rainy, 
    65: rainy,
    66: rainy, 
    67: rainy,
    80: rainy, 
    81: rainy, 
    82: rainy,
    
    71: snow, 
    73: snow, 
    75: snow,
    77: snow,
    85: snow, 
    86: snow,
    
    95: storm, 
    96: storm, 
    99: storm
};

const getWeatherIcon = (code) => WEATHER_ICONS[code] || sunny;

function WeatherApp() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDaysMenuOpen, setIsDaysMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleDaysMenu = () => setIsDaysMenuOpen(!isDaysMenuOpen);

    // Weather App states
    const [searchQuery, setSearchQuery] = useState(''); 
    const [locationName, setLocationName] = useState('Berlin, Germany'); // Default to Berlin Germany
    const [weatherData, setWeatherData] = useState(null); // Pure API data response
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiError, setApiError] = useState(null);

    // Units toggle states (Default to Metric)
    const [unitSystem, setUnitSystem] = useState('metric'); // 'Metric' or 'Imperial'
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const DEFAULT_CITY = 'Berlin';
    const errorMessage = "We couldn't connect to the server (API error). Please try again in a few moments."

    const fetchWeather = async (city) => {
        if  (!city) return;
        setLoading(true);
        setError(null);
        setApiError(null);

        try {
            // --- GEO CODING ---
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoResponse = await fetch(geoUrl);

            if (!geoResponse.ok) {
                throw new Error(errorMessage);
            }

            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                setError("No search result found!");
                setLoading(false);
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            setLocationName(`${name}, ${country}`);

            // --- UNIT CONFIGURATION ---
            const temptUnit = unitSystem === 'metric' ? 'celsius' : 'fahrenheit';
            const windUnit = unitSystem === 'metric' ? 'kmh' : 'mph';

            // --- FETCH METRO WEATHER ---
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${temptUnit}&wind_speed_unit=${windUnit}&precipitation_unit=mm&timezone=auto`;

            const weatherResponse = await fetch(weatherUrl);

            if (!weatherResponse.ok) {
                throw new Error(errorMessage);
            }

            const finalData = await weatherResponse.json();
            setWeatherData(finalData);
        } catch (err) {
            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(locationName.split(',')[0]);
    }, [unitSystem]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchWeather(searchQuery);
        setSuggestions([]);
    };

    useEffect(() => {
        const getSuggestions = async () => {
            if (searchQuery.trim().length < 3) {
                setSuggestions([]);
                return;
            }

            setIsSearchingSuggestions(true);

            try {
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`;
                const response = await fetch(geoUrl);
                const data = await response.json();
                setSuggestions(data.results || []);
            } catch (err) {
                console.error("Error fetching city dropdown suggestions:", err);
            } finally {
                setIsSearchingSuggestions(false);
            }
        };

        const delayTimer = setTimeout(() => {
            getSuggestions();
        }, 300);
        return () => clearTimeout(delayTimer);
    }, [searchQuery]);

    return (
        <div className="weather-page-container">
            <header> 
                <section className="section-one" onClick={() => window.location.reload()}>
                    <img src={logoIcon} alt="Weather Logo" />   
                </section>
                
                <section className="section-two">
                    <div className="unit-dropdown-wrapper">
                        <div className="units-container" onClick={toggleMenu}>
                            <img src={unitIcon} alt="Unit Icon" />
                            <p>Units</p>
                            <img src={dropdown} alt="Dropdown Icon" />
                        </div>
                    
                        {isMenuOpen && (
                            <div className="unit-dropdown-menu">
                                <button 
                                    className='unit-dropdown-item master-toggle' 
                                    onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                                >
                                    Switch to {unitSystem === 'metric' ? 'Imperial' : 'Metric'}
                                </button>
                                {/* <p>Current System: {unitSystem.toUpperCase()}</p> */}
    
                                <p>Temperature</p>
                            
                                <div 
                                    className='unit-dropdown-item'
                                    style={{ backgroundColor: unitSystem === 'metric' ? 'var(--Neutral-700)' : 'transparent' }}
                                >
                                    Celsius (°C)
                                    {unitSystem === 'metric' && <img src={checkMark} alt="Selected" className="checkmark-icon" />}
                                </div>

                                <div 
                                    className='unit-dropdown-item'
                                    style={{ backgroundColor: unitSystem === 'imperial' ? 'var(--Neutral-700)' : 'transparent' }}
                                >
                                    Fahrenheit (°F)
                                    {unitSystem === 'imperial' && <img src={checkMark} alt="Selected" className="checkmark-icon" />}
                                </div>
                                
                                <div className="divider"></div>
    
                                <p>Wind Speed</p>
    
                                <div 
                                    className='unit-dropdown-item'
                                    style={{ backgroundColor: unitSystem === 'metric' ? 'var(--Neutral-700)' : 'transparent' }}
                                >
                                    km/h
                                    {unitSystem === 'metric' && <img src={checkMark} alt="Selected" className="checkmark-icon" />}
                                </div>

                                <div 
                                    className='unit-dropdown-item'
                                    style={{ backgroundColor: unitSystem === 'imperial' ? 'var(--Neutral-700)' : 'transparent' }}
                                >
                                    mph
                                    {unitSystem === 'imperial' && <img src={checkMark} alt="Selected" className="checkmark-icon" />}
                                </div>
    
                                <div className="divider"></div>
    
                                <p>Precipitation</p>
    
                                <button 
                                    className='unit-dropdown-item'
                                    style={{ backgroundColor: unitSystem === 'metric' ? 'var(--Neutral-700)' : 'transparent' }}    
                                >
                                    Millimeters (mm)
                                    {unitSystem === 'metric' && <img src={checkMark} alt="Selected" className="checkmark-icon" />}
                                </button>

                                <button 
                                    className='unit-dropdown-item'
                                    style={{ backgroundColor: unitSystem === 'imperial' ? 'var(--Neutral-700)' : 'transparent' }}
                                >
                                    Inches (in)
                                    {unitSystem === 'imperial' && <img src={checkMark} alt="Selected" className="checkmark-icon" />}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </header>

            {apiError ? (
                <div className="error-container">
                    <img src={errorIcon} alt="Error Icon" className="errorIcon"/>
                    <h1>Somethin went wrong</h1>
                    <p className="api-status-error">{apiError}</p>
                    
                    <button 
                        className="retryBtn"
                        type='button'
                        onClick={() => window.location.reload()}
                    >
                        <img src={retryIcon} alt="Retry Icon" />
                        <p>Retry</p>
                    </button>
                </div>
            ) : (
                <section className="main-section">
                    <h1 className='main-title'>How's the sky looking today?</h1>   
                    
                    <form onSubmit={handleSearchSubmit}>
                        <div className="input-wrapper">
                            <div className="search-bar-wrapper">
                                <div className="input-container">
                                    <img src={searchIcon} alt="Search Icon" />
                                    <input
                                        type="text"
                                        placeholder="Search for a place..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setSearchQuery(newValue);

                                            if (newValue.trim() === '') {
                                                setSuggestions([]);
                                                fetchWeather(DEFAULT_CITY);
                                            }
                                        }}
                                    
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                                
                                {suggestions.length > 0 && !isSearchingSuggestions && (
                                    <div className="city-selection-name">
                                    {suggestions.map((city) => {
                                            return (
                                                <button
                                                    key={city.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocationName(`${city.name}`);
                                                        fetchWeather(city.name);
                                                        setSuggestions([]);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    <span>{city.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>   
                                )}
                            </div>

                            {isSearchingSuggestions && (
                                <div className="loading-message">
                                    <img src={loadingIcon} alt="Loading State" className="loading-icon-spinner"/>
                                    <p className="loading-message-text">Search in progress</p>
                                </div>
                            )}
                        </div>

                        <button type="submit" className='searchBtn'>Search</button>
                    </form>

                    {error && <p className="status-message error">{error}</p>}

                    {loading && !weatherData && !error && (
                        <div className="initial-weather-loading">
                            <img src={loadingIcon} alt="" className="loading-icon-spinner" />
                            <p>Loading weather data...</p>
                        </div>
                    )}
                
                    {weatherData && !error && (
                        <div className="weather-container">
                            {/* weather card */}
                                <div className={`weather-card ${loading ? 'is-loading' : ''}`}>
                                    {loading ? ( 
                                        <div className="card-loading-wrapper">
                                            <div className="loader"></div>
                                            Loading...
                                        </div>
                                    ) : (
                                    <div className="weather-main-details">
                                        <div className="weather-main-left">
                                            <h2>{locationName}</h2>
                                            <p>{new Date(weatherData.current.time).toLocaleDateString(undefined,{weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</p>
                                        </div>
                                        <div className="weather-main-right">
                                            <img src={getWeatherIcon(weatherData.current.weather_code)} alt="Current status condition" />
                                            <h1>
                                                {Math.round(weatherData.current.temperature_2m)}
                                                {weatherData.current_units.temperature_2m}
                                            </h1>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            {/* Weather description */}
                            <div className="weather-description-container">
                                <div className="weather-description">
                                    <div>
                                        <p>Feels like</p>
                                        {loading ? (
                                            <span className="skeleton-loader sk-metric">—</span>
                                        ) : (
                                            <h4>{Math.round(weatherData.current.apparent_temperature)}{weatherData.current_units.apparent_temperature}</h4>
                                        )}
                                    </div>
                                    <div>
                                        <p>Humidity</p>
                                        {loading ? (
                                            <span className="skeleton-loader sk-metric">—</span>
                                        ) : (
                                            <h4>{weatherData.current.relative_humidity_2m}%</h4>
                                        )}
                                    </div>
                                    <div>
                                        <p>Wind</p>
                                        {loading ? (
                                            <span className="skeleton-loader sk-metric">—</span>
                                        ) : (
                                            <h4>{weatherData.current.wind_speed_10m} {weatherData.current_units.wind_speed_10m}</h4>
                                        )}
                                    </div>
                                    <div>
                                        <p>Precipitation</p>
                                        {loading ? (
                                            <span className="skeleton-loader sk-metric">—</span>
                                        ) : (
                                            <h4>{weatherData.current.precipitation} mm</h4>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* daily forecast */}
                            <div className="daily-forecast-container">
                                <h3>Daily Forecast</h3>
                                <div className="daily-forecast-contents">
                                    {weatherData.daily.time.map((time, index) => {
                                        const dateObj = new Date(time);
                                        const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                                        const maxTemp = Math.round(weatherData.daily.temperature_2m_max[index]);
                                        const minTemp = Math.round(weatherData.daily.temperature_2m_min[index]);
                                        const dayCode = weatherData.daily.weather_code[index];

                                        return (
                                            <div key={time} className="forecast-day-card">
                                                {loading ? (
                                                    <div className="skeleton-loader"></div>
                                                ) : (
                                                    <>
                                                        <h3>{dayName}</h3>
                                                        <img src={getWeatherIcon(dayCode)} alt={dayName}/>
                                                        <div className="max-min-temp">
                                                            <p>{maxTemp}°</p>
                                                            <p>{minTemp}°</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })} 
                                </div>
                            </div>

                            {/* hourly forecast */}
                            <div className="hourly-forecast-container">
                                <div className="hourly-forecast">
                                    <div className="hourly-forecast-header">
                                        <h3>Hourly forecast</h3>
                                    
                                        <div className="days-selection-wrapper">
                                            <button className="select-days-btn" onClick={toggleDaysMenu}>
                                                {loading ? (
                                                    <span className="skeleton-loader sk-metric">—</span>
                                                ) : (
                                                    <>
                                                        {new Date(weatherData.daily.time[selectedDayIndex]).toLocaleDateString(undefined, {weekday: 'long' })}
                                                    </>
                                                )}
                                            </button>
                                            {isDaysMenuOpen && (
                                                <div className="days-selection-menu">
                                                    {weatherData.daily.time.map((time, index) => {
                                                        const label = new Date(time).toLocaleDateString(undefined, { weekday: 'long' });
                                                        return (
                                                            <button
                                                                key={time}
                                                                className="days-selection-item"
                                                                onClick={() => {
                                                                    setSelectedDayIndex(index);
                                                                    setIsDaysMenuOpen(false);
                                                                }}
                                                            >
                                                                {label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="hourly-forecast-contents">
                                        {loading ? (
                                            <>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                                <div className="hourly-time-block"></div>
                                            </>
                                        ) : (
                                            (() => {
                                                const startIndex = selectedDayIndex * 24;
                                                const hourlySlice = [];
                                                for (let i = startIndex; i < startIndex + 24; i += 1) {
                                                    hourlySlice.push(i);
                                                }

                                                return hourlySlice.map((index) => {
                                                    const timeValue = weatherData.hourly.time[index];
                                                    const tempValue = Math.round(weatherData.hourly.temperature_2m[index]);
                                                    const codeValue = weatherData.hourly.weather_code[index];
                                                    const displayHour = new Date(timeValue).toLocaleTimeString(undefined, {hour: 'numeric', hour12: true });
                                                    
                                                    return (
                                                        <div key={timeValue} className="hourly-time-block">
                                                            <div className="time-block-right">
                                                                <img src={getWeatherIcon(codeValue)} alt="Hourly Status" />
                                                                <p>{displayHour}</p>
                                                            </div>
                                                            
                                                            <div className="time-block-left">
                                                                <h4>{tempValue}°</h4>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}                
        </div>
    )
}

export default WeatherApp;
