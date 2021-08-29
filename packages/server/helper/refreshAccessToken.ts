import axios from 'axios';

import { logger } from 'shared/logger';
import type { SpotifyAPI } from 'shared/types';
import { SPOTIFY_AUTHORIZE_BASE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@/config/constants';

export const refreshAccessToken = (refresh_token: string | undefined): Promise<SpotifyAPI.Auth.Token | undefined> => {
  if (refresh_token == null) {
    return Promise.resolve(undefined);
  }

  const params: SpotifyAPI.Auth.RefreshToken.Params = {
    grant_type: 'refresh_token',
    refresh_token,
  };
  // TODO: クライアントはまとめる
  return axios.post(`${SPOTIFY_AUTHORIZE_BASE_URL}/api/token`, undefined, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: SPOTIFY_CLIENT_ID,
      password: SPOTIFY_CLIENT_SECRET,
    },
    params,
  })
    .then((res) => res.data)
    .catch((err: Error) => {
      logger.error({ err });
      return undefined;
    });
};
