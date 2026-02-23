import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5002/api', // Replace with actual backend URL
});

export default api;
