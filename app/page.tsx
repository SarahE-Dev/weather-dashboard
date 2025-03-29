"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Droplets, Wind, Thermometer, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function WeatherDashboard() {
  const [location, setLocation] = useState("Nashville"); // Initial location
  const [searchInput, setSearchInput] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUS, setIsUS] = useState(false);
  const { toast } = useToast();
  const [useMock, setUseMock] = useState(false); // Only set to true on API failure

  // Detect if user is in the US based on browser locale
  useEffect(() => {
    const userLocale = navigator.language;
    setIsUS(userLocale === "en-US");
  }, []);

  // Convert Celsius to Fahrenheit
  const toFahrenheit = useCallback((celsius: number) => {
    return Math.round((celsius * 9) / 5 + 32);
  }, []);

  // Generate mock data (only called when explicitly needed)
  const generateMockData = useCallback((loc: string) => {
    const mockWeatherData = {
      location: loc,
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      feelsLike: Math.floor(Math.random() * 30) + 5,
      isDay: new Date().getHours() > 6 && new Date().getHours() < 18,
    };

    const mockForecastData = Array.from({ length: 5 }, (_, i) => ({
      day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "short" }),
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
    }));

    const mockHourlyData = Array.from({ length: 12 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() + i);
      return {
        time: hour.toLocaleTimeString("en-US", { hour: "numeric" }),
        temp: Math.floor(Math.random() * 10) + (mockWeatherData.temperature || 20) - 5,
        condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
      };
    });

    return {
      weather: mockWeatherData,
      forecast: mockForecastData,
      hourlyForecast: mockHourlyData,
    };
  }, []);

  // Fetch weather data from WeatherAPI
  const fetchWeather = useCallback(
    async (loc: string) => {
      setLoading(true);
      try {
        const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

        if (!API_KEY) {
          throw new Error("No API key found.");
        }

        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${loc}&days=5&aqi=no&alerts=no`
        );

        if (!response.ok) {
          throw new Error("Weather data not available");
        }

        const data = await response.json();
        console.log(data);

        setWeather({
          location: data.location.name,
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          feelsLike: Math.round(data.current.feelslike_c),
          isDay: data.current.is_day === 1,
        });

        const forecastData = data.forecast.forecastday.map((day: any) => {
          const forecastDate = new Date(`${day.date}T00:00:00Z`);
          return {
            day: forecastDate.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
            temperature: Math.round(day.day.avgtemp_c),
            condition: day.day.condition.text,
          };
        });
        setForecast(forecastData);

        const hourlyData = data.forecast.forecastday
          .flatMap((day: any) => day.hour)
          .filter((hour: any) => new Date(hour.time).getTime() > new Date().getTime())
          .slice(0, 12)
          .map((hour: any) => ({
            time: new Date(hour.time).toLocaleTimeString("en-US", { hour: "numeric" }),
            temp: Math.round(hour.temp_c),
            condition: hour.condition.text,
            isDay: hour.is_day === 1,
          }));
        setHourlyForecast(hourlyData);

        setLastUpdated(new Date());
        setUseMock(false); // Reset mock flag on successful fetch
      } catch (error) {
        console.error("Error fetching weather data:", error);
        toast({
          title: "Error fetching weather data",
          description: "Using mock data as fallback.",
          variant: "destructive",
        });

        // Fallback to mock data only if there’s a location and no weather data
        if (loc && !weather) {
          const mock = generateMockData(loc);
          setWeather(mock.weather);
          setForecast(mock.forecast);
          setHourlyForecast(mock.hourlyForecast);
          setLastUpdated(new Date());
          setUseMock(true);
        }
      } finally {
        setLoading(false);
        setSearchInput("");
      }
    },
    [toast, weather] // Depend on weather to check if data exists
  );

  // Initial fetch on mount
  useEffect(() => {
    if(!weather)  fetchWeather(location); // Fetch real data for "Nashville" on mount

    const interval = setInterval(() => {
      fetchWeather(location); // Periodic refresh
    }, 5 * 60 * 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchWeather, location]); // Depend on location for refetch on change

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim()) {
        setLocation(searchInput);
        fetchWeather(searchInput); // Fetch immediately for new location
      }
    },
    [searchInput, fetchWeather]
  );

  const refreshWeather = useCallback(() => {
    fetchWeather(location);
    toast({
      title: "Weather data refreshed",
      description: `Latest data for ${location}`,
    });
  }, [location, fetchWeather, toast]);

  const getWeatherIcon = useCallback((condition: string, isDay = true) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return isDay ? "☀️" : "🌙";
    } else if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
      return "☁️";
    } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle") || conditionLower.includes("shower")) {
      return "🌧️";
    } else if (conditionLower.includes("partly")) {
      return isDay ? "⛅" : "☁️";
    } else if (conditionLower.includes("snow") || conditionLower.includes("blizzard")) {
      return "❄️";
    } else if (conditionLower.includes("thunder") || conditionLower.includes("lightning")) {
      return "⚡";
    } else if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
      return "🌫️";
    } else {
      return isDay ? "🌤️" : "🌙";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-800 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
            Weather Dashboard
          </h1>
          <p className="text-fuchsia-200">Real-time weather information at your fingertips</p>
        </header>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Search and location section */}
          <Card className="bg-white/10 backdrop-blur-md border-fuchsia-400/20 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-cyan-300">Location</CardTitle>
              <CardDescription className="text-fuchsia-200">Search for a city</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-300" />
                  <Input
                    type="text"
                    placeholder="Enter city name..."
                    className="pl-8 bg-white/10 border-fuchsia-400/30 text-white placeholder:text-fuchsia-300"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </form>

              {lastUpdated && (
                <div className="mt-4 flex items-center justify-between text-xs text-fuchsia-300">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshWeather}
                    className="h-6 px-2 text-cyan-300 hover:text-cyan-200 hover:bg-fuchsia-700/50"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current weather section */}
          <Card className="bg-white/10 backdrop-blur-md border-fuchsia-400/20 md:col-span-3">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-cyan-300">Current Weather</CardTitle>
                  <CardDescription className="text-fuchsia-200 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {weather?.location}
                  </CardDescription>
                </div>
                {weather && (
                  <div className="text-5xl font-bold">{getWeatherIcon(weather.condition, weather.isDay)}</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-200"></div>
                </div>
              ) : weather ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-5xl font-bold mb-2">
                      {isUS ? toFahrenheit(weather.temperature) : weather.temperature}°{isUS ? "F" : "C"}
                    </div>
                    <div className="text-fuchsia-200">{weather.condition}</div>
                  </div>
                  <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-lg">
                    <Thermometer className="h-6 w-6 mb-2 text-cyan-400" />
                    <div className="text-xl font-semibold">
                      {isUS ? toFahrenheit(weather.feelsLike) : weather.feelsLike}°{isUS ? "F" : "C"}
                    </div>
                    <div className="text-sm text-fuchsia-200">Feels Like</div>
                  </div>
                  <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-lg">
                    <Droplets className="h-6 w-6 mb-2 text-cyan-400" />
                    <div className="text-xl font-semibold">{weather.humidity}%</div>
                    <div className="text-sm text-fuchsia-200">Humidity</div>
                  </div>
                  <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-lg">
                    <Wind className="h-6 w-6 mb-2 text-cyan-400" />
                    <div className="text-xl font-semibold">
                      {isUS ? Math.round(weather.windSpeed * 0.621) : weather.windSpeed} {isUS ? "mph" : "km/h"}
                    </div>
                    <div className="text-sm text-fuchsia-200">Wind Speed</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-fuchsia-200">No weather data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forecast section */}
        <Card className="mt-6 bg-white/10 backdrop-blur-md border-fuchsia-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-300">3-Day Forecast</CardTitle>
            <CardDescription className="text-fuchsia-200">Weather prediction for the upcoming days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-200"></div>
              </div>
            ) : forecast ? (
              <div className="grid grid-cols-1 sm:grid-col-2 md:grid-cols-3 gap-4">
                {forecast.map((day: any, index: number) => (
                  <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="font-medium mb-2">{day.day}</div>
                    <div className="text-3xl mb-2">{getWeatherIcon(day.condition, true)}</div>
                    <div className="text-xl font-semibold">
                      {isUS ? toFahrenheit(day.temperature) : day.temperature}°{isUS ? "F" : "C"}
                    </div>
                    <div className="text-sm text-fuchsia-200">{day.condition}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-fuchsia-200">No forecast data available</div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-fuchsia-300 border-t border-fuchsia-400/20 pt-4">
            Weather data updates automatically every 5 minutes
          </CardFooter>
        </Card>

        {/* Additional weather insights */}
        <Tabs defaultValue="hourly" className="mt-6">
          <TabsList className="bg-white/10 border border-fuchsia-400/20">
            <TabsTrigger
              value="hourly"
              className="text-white data-[state=active]:bg-gradient-to-r from-cyan-500 to-cyan-600 data-[state=inactive]:text-white/80"
            >
              Hourly
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-white data-[state=active]:bg-gradient-to-r from-cyan-500 to-cyan-600 data-[state=inactive]:text-white/80"
            >
              Details
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hourly">
            <Card className="bg-white/10 backdrop-blur-md border-fuchsia-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-300">Hourly Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex overflow-x-auto hide-scrollbar pb-4 gap-4">
                  {hourlyForecast ? (
                    hourlyForecast.map((hour: any, index: number) => (
                      <div key={index} className="flex-shrink-0 text-center p-4 bg-white/5 rounded-lg w-24">
                        <div className="text-sm font-medium mb-2">{hour.time}</div>
                        <div className="text-2xl mb-1">{getWeatherIcon(hour.condition, hour.isDay)}</div>
                        <div className="text-lg font-semibold">
                          {isUS ? toFahrenheit(hour.temp) : hour.temp}°{isUS ? "F" : "C"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-6 text-fuchsia-200">No hourly forecast available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details">
            <Card className="bg-white/10 backdrop-blur-md border-fuchsia-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-300">Weather Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Pressure", value: "1015 hPa" },
                    { label: "Visibility", value: isUS ? "6.2 miles" : "10 km" },
                    { label: "UV Index", value: "5 (Moderate)" },
                    { label: "Dew Point", value: isUS ? "54°F" : "12°C" },
                    { label: "Sunrise", value: "6:42 AM" },
                    { label: "Sunset", value: "7:51 PM" },
                    { label: "Moon Phase", value: "Waxing Crescent" },
                    { label: "Air Quality", value: "Good" },
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-fuchsia-300">{item.label}</div>
                      <div className="text-lg font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
