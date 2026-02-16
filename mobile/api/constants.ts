// This file will contain constants and helper functions related to API calls, such as the base URL for your backend server. This way, you can easily manage and update your API endpoints in one place.


export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
export const IP_ADDRESS = process.env.EXPO_PUBLIC_IP_ADDRESS || 'localhost';

// For Expo Go testing on physical iPhone, use the local network IP address instead of localhost
export const IPHONE_TESTING_URL = `http://${IP_ADDRESS}:5000`;
