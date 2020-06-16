import { Swatch } from 'node-vibrant/lib/color';
import { SpotifyAPI } from '~~/types';

export namespace App {
  export type DominantColorInfo = {
    hex: Swatch['hex']
    rgb: Swatch['rgb']
  }

  // TrackTable component
  export type SimpleTrackDetail = {
    index: number
    id: SpotifyAPI.SimpleTrack['id']
    name: SpotifyAPI.SimpleTrack['name']
    uri: SpotifyAPI.SimpleTrack['uri']
    trackNumber: SpotifyAPI.SimpleTrack['track_number']
    discNumber: SpotifyAPI.SimpleTrack['disc_number']
    hash: string
    artistList: {
      name: SpotifyAPI.Artist['name'],
      id: SpotifyAPI.Artist['id'],
    }[]
    explicit: boolean
    isPlayable: boolean
    isSaved: boolean
    duration: string
  }
  // TrackList component
  export type TrackDetail = SimpleTrackDetail & {
    artworkSrc: string | undefined
    releaseId: string
    releaseName: string
  }
  // PlaylistTrackTable component
  export type PlaylistTrackDetail = {
    index: number
    id: SpotifyAPI.SimpleTrack['id']
    name: SpotifyAPI.SimpleTrack['name']
    uri: SpotifyAPI.SimpleTrack['uri']
    releaseId: string
    releaseName: string
    hash: string
    artistList: {
      name: SpotifyAPI.Artist['name'],
      id: SpotifyAPI.Artist['id'],
    }[]
    explicit: boolean
    isPlayable: boolean
    isSaved: boolean
    duration: string
    addedAt: AddedAtInfo
  }
  export type TrackQueueInfo = {
    isPlaying: boolean
    id: string | undefined
    name: string
    uri: string
    artistList: {
      id: string
      name: string
    }[]
    releaseName: string
    releaseId: string
    artworkSrc: string | undefined
  }

  // /releases/:releaseId page
  export type ReleaseInfo = {
    albumType: 'アルバム' | 'シングル' | 'コンピレーション'
    artistList: App.SimpleArtistInfo[]
    label: string
    name: string
    id: string
    uri: string
    releaseDate: string
    releaseDatePrecision: string
    artworkSrc: string | undefined
    trackList: App.SimpleTrackDetail[]
    totalTracks: number
    durationMs: number
    copyrightList: SpotifyAPI.Copyright[]
    isSaved: boolean
  }
  export type ReleaseCardInfo = {
    type: 'album' | 'track'
    releaseType: 'album' | 'single' | 'compilation' | 'appears_on'
    name: string //  track または album の name
    id: string //  track または album の id
    releaseId: string
    uri: string
    artists: App.SimpleArtistInfo[]
    releaseYear?: string
    artworkSrc: string | undefined
  }

  export type SimpleArtistInfo = {
    name: string
    id: string
  }
  // /artists/:artistId page
  export type ArtistInfo = {
    name: string
    id: string
    uri: string
    avatarSrc: string | undefined
    followersText: string
  }
  export type ArtistCardInfo = {
    name: string
    id: string
    uri: string
    avatarSrc: string | undefined
  }

  // /playlists/:playlistId page
  export type PlaylistInfo = {
    id: string
    name: string
    description: string | null
    uri: string
    owner: SpotifyAPI.UserData
    artworkSrc: string | undefined
    durationMs: number
    totalTracks: number
    isFollowing: boolean | undefined
    followersText: string
  }
  export type PlaylistTrackInfo = {
    trackList: PlaylistTrackDetail[]
    isFullTrackList: boolean
  }
  export type FilteredPlaylistTrack = SpotifyAPI.PlaylistTrack & {
    track: SpotifyAPI.Track
  }
  export type PlaylistCardInfo = {
    id: string
    name: string
    description: string | null
    uri: string
    artworkSrc: string | undefined
  }

  export type AddedAtInfo = {
    fromNow: string
    yyyymd: string
    title: string
    overTwoWeeksAgo: boolean
  }

  export type CategoryInfo = {
    id: string
    name: string
    artworkSrc: string | undefined
  }
}
