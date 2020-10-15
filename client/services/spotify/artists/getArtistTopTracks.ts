import { Context } from '@nuxt/types';
import { SpotifyAPI } from '~~/types';

type Tracks = { tracks: SpotifyAPI.Track[] };

export const getArtistTopTracks = (context: Context) => {
  const { app } = context;

  return ({ artistId, country }: {
    artistId: string;
    country: SpotifyAPI.Country;
  }): Promise<Partial<Tracks>> => {
    return app.$spotifyApi.$get<Tracks>(`/artists/${artistId}/top-tracks`, {
      params: {
        country,
      },
    }).catch((err: Error) => {
      console.error({ err });
      return {};
    });
  };
};
