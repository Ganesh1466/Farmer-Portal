import WeatherDashboard from '../components/Weather/WeatherDashboard';

const Weather = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Weather Forecast</h1>
            <WeatherDashboard />
        </div>
    );
};

export default Weather;
