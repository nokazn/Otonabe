import axios from 'axios';
import { SpotifyAPI } from '~~/types';

export const getAccessToken = (
  code: string,
): Promise<SpotifyAPI.Auth.TokenResponseData> | null => {
  const redirectUrl = process.env.BASE_URL;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (redirectUrl == null || clientId == null || clientSecret == null) {
    console.error(
      '環境変数が設定されていません。',
      JSON.stringify({
        redirectUrl,
        clientId,
        clientSecret,
      }, undefined, 2),
    );
    return null;
  }

  const baseUrl = 'https://accounts.spotify.com/api/token';
  const params: SpotifyAPI.Auth.TokenRequestBody = {
    grant_type: 'authorization_code',
    code,
    // validation のためのもので実際にレダイレクトされるわけではない
    redirect_uri: `${redirectUrl}/login/callback`,
  };

  return axios.post(baseUrl, undefined, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: clientId,
      password: clientSecret,
    },
    params,
  })
    .then((res) => res.data)
    .catch((err: Error) => {
      console.error({ err });
      return null;
    });
};
