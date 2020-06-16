import { elapsedTime } from '~~/utils/elapsedTime';
import { App, SpotifyAPI } from '~~/types';
import { getImageSrc } from './getImageSrc';

export const convertTrackDetail = ({ isTrackSavedList, artworkSize }: {
  isTrackSavedList: boolean[]
  artworkSize?: number
}) => (
  track: SpotifyAPI.Track,
  index: number,
): App.TrackDetail => {
  const detail = {
    index,
    name: track.name,
    id: track.id,
    uri: track.uri,
    trackNumber: track.track_number,
    discNumber: track.disc_number,
    hash: `${track.disc_number}-${track.track_number}`,
    artistList: track.artists.map((artist) => ({
      name: artist.name,
      id: artist.id,
    })),
    explicit: track.explicit,
    isPlayable: track.is_playable,
    isSaved: isTrackSavedList[index],
    duration: elapsedTime(track.duration_ms),
    artworkSrc: getImageSrc(track.album.images, artworkSize),
    releaseId: track.album.id,
    releaseName: track.album.name,
  };

  return detail;
};
