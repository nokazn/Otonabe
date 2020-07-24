import { Actions } from 'typed-vuex';

import { PlayerState } from './state';
import { PlayerGetters } from './getters';
import { PlayerMutations } from './mutations';
import { APP_NAME } from '~/variables';
import { ServerAPI } from '~~/types';

export type PlayerActions = {
  initPlayer: () => void
  disconnectPlayer: () => void
};

export type RootActions = {
  'player/initPlayer': PlayerActions['initPlayer']
  'player/disconnectPlayer': PlayerActions['disconnectPlayer']
};

const actions: Actions<PlayerState, PlayerActions, PlayerGetters, PlayerMutations> = {
  initPlayer({
    commit,
    getters,
    dispatch,
    rootGetters,
  }) {
    const isLoggedin = rootGetters['auth/isLoggedin'];
    if (!isLoggedin) {
      window.onSpotifyWebPlaybackSDKReady = () => {};
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = async () => {
      // player が登録されていないときのみ初期化
      if (getters.isPlayerConnected || window.Spotify == null) return;

      const player = new Spotify.Player({
        name: APP_NAME,
        // アクセストークンの更新が必要になったら呼ばれる
        getOAuthToken: async (callback) => {
          const {
            accessToken,
            expireIn,
          }: ServerAPI.Auth.Token = await this.$serverApi.$post('/api/auth/refresh')
            .catch((err) => {
              console.error({ err });
              return {};
            });

          commit('auth/SET_TOKEN', accessToken, { root: true });
          commit('auth/SET_EXPIRE_MILLIS', expireIn, { root: true });

          const currentTimerId = this.$state().auth.refreshTokenTimerId;
          if (currentTimerId != null) {
            clearTimeout(currentTimerId);
          }

          if (accessToken == null) {
            await dispatch('auth/logout', undefined, { root: true });
            this.$router.push('/login');
            this.$toast.show('error', 'トークンを取得できなかったためログアウトしました。');
            return;
          }

          // 50 分後にまだトークンが更新されてなかった場合更新
          const interval = 1000 * 60 * 50;
          const refreshTokenTimer = setTimeout(() => {
            // interval 経過後の状態を取得するため、引数の getters ではなく context から呼び出している
            if (this.$getters()['auth/isTokenExpired']) {
              dispatch('auth/refreshAccessToken', undefined, { root: true });
            }
          }, interval);
          commit('auth/SET_REFRESH_TOKEN_TIMER_ID', refreshTokenTimer, { root: true });

          callback(accessToken);
        },
      });

      /**
       * デバイスの接続が完了したとき
       */
      player.addListener('ready', async ({ device_id }) => {
        commit('playback/SET_DEVICE_ID', device_id, { root: true });

        await dispatch('playback/getActiveDeviceList', undefined, { root: true });

        const activeDevice = this.$getters()['playback/activeDevice'];
        if (activeDevice == null) {
          // アクティブなデバイスがない場合はこのデバイスで再生
          await dispatch('playback/transferPlayback', {
            deviceId: device_id,
            play: false,
          }, { root: true });
        }

        // このデバイスで再生中の場合は初回の更新は30秒後、ほかのデバイスで再生中の場合はすぐに取得
        const interval = activeDevice?.id === device_id
          ? 30 * 1000
          : 0;
        await dispatch('playback/getCurrentPlayback', interval, { root: true });

        console.log('Ready with this device 🎉');
      });

      /**
       * デバイスがオフラインのとき
       */
      player.addListener('not_ready', ({ device_id }) => {
        console.log('This device has gone offline 😴', device_id);
      });

      // エラーが発生した場合
      const errorList: Spotify.ErrorTypes[] = [
        'initialization_error',
        'account_error',
        'playback_error',
      ];
      errorList.forEach((errorType) => {
        player.addListener(errorType, (err) => {
          console.error({ errorType, err });
        });
      });

      // 認証エラーが発生した場合
      player.addListener('authentication_error', async (err) => {
        console.error({ err });
        await dispatch('auth/refreshAccessToken', undefined, { root: true });
      });

      /**
       * 再生状態の変更を受信したとき
       */
      player.addListener('player_state_changed', ((playerState) => {
        // playerState は Nullable
        if (playerState == null) return;

        const {
          trackId: currentTrackId,
          repeatMode: currentRepeatMode,
        } = this.$state().playback;
        // @todo
        console.log(playerState);
        const {
          context: { uri },
          track_window: { current_track: track },
        } = playerState;

        // track を変更する前に行う
        const trackId = track.id;
        // アイテムが取得でき、id 変わったときだけチェック
        if (trackId != null && trackId !== currentTrackId) {
          dispatch('playback/checkTrackSavedState', trackId, { root: true });
        }

        commit('playback/SET_IS_PLAYING', !playerState.paused, { root: true });
        // 表示playback/のちらつきを防ぐためにトラック (duration_ms) をセットしてからセ, { root: true }ット
        commit('playback/SET_DURATION_MS', playerState.duration, { root: true });
        commit('playback/SET_POSITION_MS', playerState.position, { root: true });
        commit('playback/SET_IS_SHUFFLED', playerState.shuffle, { root: true });
        commit('playback/SET_CONTEXT_URI', uri ?? undefined, { root: true });
        commit('playback/SET_CURRENT_TRACK', track, { root: true });
        commit('playback/SET_NEXT_TRACK_LIST', playerState.track_window.next_tracks, { root: true });
        commit('playback/SET_PREVIOUS_TRACK_LIST', playerState.track_window.previous_tracks, { root: true });
        commit('playback/SET_DISALLOWS', playerState.disallows, { root: true });

        // 表示がちらつくので、初回以外は player/repeat 内で commit する
        if (currentRepeatMode == null) {
          commit('playback/SET_REPEAT_MODE', playerState.repeat_mode, { root: true });
        }
        // playback-sdk から提供される uri が存在する場合は customContext をリセット
        if (uri != null) {
          dispatch('playback/resetCustomContext', undefined, { root: true });
        }
      }));

      await player.connect();

      commit('SET_PLAYBACK_PLAYER', player);
    };

    window.onSpotifyWebPlaybackSDKReady();
  },

  disconnectPlayer({ state, commit }) {
    const { playbackPlayer } = state;
    if (playbackPlayer == null) return;

    playbackPlayer.disconnect();

    // タイマーはクリア
    commit('playback/SET_GET_CURRENT_PLAYBACK_TIMER_ID', undefined, { root: true });
    commit('SET_PLAYBACK_PLAYER', undefined);
    commit('playback/SET_DEVICE_ID', undefined, { root: true });
    commit('playback/SET_ACTIVE_DEVICE_ID', undefined, { root: true });
    commit('playback/SET_DEVICE_LIST', [], { root: true });
    commit('playback/SET_CUSTOM_CONTEXT_URI', undefined, { root: true });
    commit('playback/SET_CUSTOM_TRACK_URI_LIST', undefined, { root: true });
    commit('playback/SET_RECENTLY_PLAYED', undefined, { root: true });
    commit('playback/SET_CURRENT_TRACK', undefined, { root: true });
    commit('playback/SET_NEXT_TRACK_LIST', [], { root: true });
    commit('playback/SET_PREVIOUS_TRACK_LIST', [], { root: true });
    commit('playback/SET_IS_SAVED_TRACK', false, { root: true });
    commit('playback/SET_IS_PLAYING', false, { root: true });
    commit('playback/SET_CONTEXT_URI', undefined, { root: true });
    commit('playback/SET_POSITION_MS', 0, { root: true });
    commit('playback/SET_DURATION_MS', undefined, { root: true });
    commit('playback/SET_DISABLED_PLAYING_FROM_BEGINING', false, { root: true });
    commit('playback/SET_IS_SHUFFLED', false, { root: true });
    commit('playback/SET_REPEAT_MODE', 0, { root: true });
    commit('playback/SET_DISALLOWS', {}, { root: true });
    commit('playback/SET_VOLUME_PERCENT', { volumePercent: 0 }, { root: true });
    commit('playback/SET_IS_MUTED', false, { root: true });
  },
};

export default actions;
