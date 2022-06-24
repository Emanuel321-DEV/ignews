import axios from 'axios';

export const api = axios.create({
    baseURL: '/api' // 'http://localhost:3000/api'
})