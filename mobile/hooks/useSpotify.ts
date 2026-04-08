import { useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';

// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
// on init:
// auth flow: exchangeCodeforToken -> setaccesstoken 
// spotifyApi -> spotifyrequest -> on expired token -> refreshtoken

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string;

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
];
WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri({ scheme: 'mobile', path: 'dashboard' });
console.log('Spotify Redirect URI:',redirectUri);

interface Track {
  name: string;
  artist: string;
  albumArt: string;
}

export const useSpotify = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);


  const [authRequest, authResponse, openSpotifyLogin] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
    },
    { authorizationEndpoint: SPOTIFY_AUTH_ENDPOINT }
  );

  useEffect(() => {
    if (authResponse?.type === 'success' && authRequest?.codeVerifier) {
      const { code } = authResponse.params;
      exchangeCodeForToken(code, authRequest.codeVerifier);
    }
  }, [authResponse]);

  const exchangeCodeForToken = async (code: string, verifier: string) => {
    try {
      const response = await axios.post(
        SPOTIFY_TOKEN_ENDPOINT,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: CLIENT_ID,
          code_verifier: verifier,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    } catch (error: any) {
      console.error('SPOTIFY:Token exchange failed:', error.response?.data || error.message);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return;
    
    try {
      const response = await axios.post(
        SPOTIFY_TOKEN_ENDPOINT,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const newToken = response.data.access_token;
      setAccessToken(newToken);
      return newToken;
    } catch (error) {
      console.error('SPOTIFY:Token refresh failed:', error);
    }
  };

  const makeSpotifyRequest = (endpoint: string, method: string, data: any, token: string) => {
    return axios({
      method,
      url: `${SPOTIFY_API_BASE}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
      data
    });
  };

  const spotifyApi = async (endpoint: string, method = 'GET', data?: any) => {
    if (!accessToken) return;

    try {
      return await makeSpotifyRequest(endpoint, method, data, accessToken);
    } catch (error: any) {
      //token expired, refresh it 
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return await makeSpotifyRequest(endpoint, method, data, newToken);
        }
      }
      throw error;
    }
  };

  const fetchCurrentTrack = async () => {
    try {
      const response = await spotifyApi('/me/player/currently-playing');
      if (response?.data?.item) {
        setCurrentTrack({
          name: response.data.item.name,
          artist: response.data.item.artists[0].name,
          albumArt: response.data.item.album.images[0]?.url,
        });
        setIsPlaying(response.data.is_playing);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (error) {
      // common to have 404 erros here cause no there are no active devices 
      console.error('SPOTIFY:error fetching track:', error);
    }
  };

  const playPause = async () => {
    try {
      await spotifyApi(`/me/player/${isPlaying ? 'pause' : 'play'}`, 'PUT');
      setIsPlaying(!isPlaying);
    } catch (error) {
      // common to have 404 erros here cause no there are no active devices 
      console.error('SPOTIFY:error playback:', error);
    }
  };

  const skip = async () => {
    try {
      await spotifyApi('/me/player/next', 'POST');
      setTimeout(fetchCurrentTrack, 500);
    } catch (error) {
      // common to have 404 erros here cause no there are no active devices 
      console.error('SPOTIFY:error skipping:', error);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };


  return {
    login: () => openSpotifyLogin(),
    isConnected: !!accessToken,
    currentTrack,
    isPlaying,
    playPause,
    skip,
    fetchCurrentTrack,
    logout

  };
};