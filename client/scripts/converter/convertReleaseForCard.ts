import { convertReleaseDate } from '~/scripts/converter/convertReleaseDate';
import { SpotifyAPI, App } from '~~/types';

export const convertReleaseForCard = (
  release: SpotifyAPI.Album | SpotifyAPI.SimpleAlbum,
): App.ReleaseCardInfo<'album'> => {
  const info = {
    type: release.type,
    releaseType: release.album_type,
    releaseId: release.id,
    id: release.id,
    name: release.name,
    uri: release.uri,
    artists: release.artists.map((artist) => ({
      name: artist.name,
      id: artist.id,
    })),
    releaseYear: convertReleaseDate({
      releaseDate: release.release_date,
      releaseDatePrecision: release.release_date_precision,
      format: 'YYYY年',
    }),
    artworkList: release.images,
    externalUrls: release.external_urls,
  };

  return info;
};
