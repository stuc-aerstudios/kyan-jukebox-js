import Mopidy from 'constants/mopidy'
import Auth from 'constants/auth'
import Settings from 'constants/settings'
import SearchConst from 'constants/search'
import TransformTrack from 'utils/transformer/transformers/mopidy/track'
import TransformTracklist from 'utils/transformer/transformers/mopidy/tracklist'
import TransformSearchResults from 'utils/transformer/transformers/spotify/search'
import NowPlaying from 'handlers/now-playing'
import settings from 'utils/local-storage'
import Spotify from 'services/spotify'
import { addTracks } from 'utils/track'

const clearSetTimeout = (timeout) => {
  clearTimeout(timeout)
  timeout = null
}

let recommendTimer

const Transform = {
  mopidyCoreMessage: (headers, data, mopidy) => {
    return new Promise((resolve) => {
      const { encoded_key: key } = headers

      switch (key) {
        case Mopidy.CORE_EVENTS.PLAYBACK_STARTED:
          return TransformTracklist([data.tl_track.track]).then(data => {
            const payload = data[0]
            const { track } = payload
            settings.addToUniqueArray(Settings.TRACKLIST_LAST_PLAYED, track.uri, 10)
            settings.setItem(Settings.TRACK_CURRENT, track.uri)
            Spotify.canRecommend(mopidy)
              .then((recommend) => {
                if (recommend) {
                  const waitToRecommend = track.length / 4 * 3
                  const lastTracksPlayed = settings.getItem(Settings.TRACKLIST_LAST_PLAYED) || []

                  clearSetTimeout(recommendTimer)
                  recommendTimer = setTimeout(recommend, waitToRecommend, lastTracksPlayed, mopidy)
                }
              })
            NowPlaying.addTrack(track)
            return resolve(payload)
          })
        case Mopidy.CORE_EVENTS.VOLUME_CHANGED:
          return resolve(data.volume)
        case Mopidy.CORE_EVENTS.PLAYBACK_STATE_CHANGED:
          return resolve(data.new_state)
        case Mopidy.CORE_EVENTS.TRACKLIST_CHANGED:
          clearSetTimeout(recommendTimer)
          return resolve(data)
        default:
          return resolve(`mopidySkippedTransform: ${key}`)
      }
    })
  },
  message: (headers, data) => {
    return new Promise((resolve) => {
      const { encoded_key: key, user } = headers

      switch (key) {
        case SearchConst.SEARCH_GET_TRACKS:
          const searchResults = data
          const searchTracks = TransformSearchResults(data.tracks.items)
          searchResults.tracks.items = searchTracks
          return resolve(searchResults)
        case Mopidy.GET_CURRENT_TRACK:
          if (!data) return resolve()

          return TransformTracklist([data]).then(TransformedData => {
            const trackInfo = TransformedData[0]
            settings.setItem(Settings.TRACK_CURRENT, trackInfo.track.uri)
            return resolve(trackInfo)
          })
        case Mopidy.GET_TRACKS:
          return TransformTracklist(data).then(tracks => {
            settings.setItem(Settings.TRACKLIST_CURRENT, tracks.map(data => data.track.uri))
            resolve(tracks)
          })
        case Mopidy.TRACKLIST_REMOVE:
          settings.removeFromArray(Settings.TRACKLIST_LAST_PLAYED, data[0].track.uri)
          return resolve(data)
        case Mopidy.TRACKLIST_ADD:
          const { data: track } = headers
          addTracks([track.uri], user)
          /* falls through */
        case Mopidy.PLAYBACK_NEXT:
        case Mopidy.PLAYBACK_PREVIOUS:
          clearSetTimeout(recommendTimer)
          if (data && data.length > 0) return resolve(TransformTrack(data[0].track))
          return resolve()
        case Mopidy.TRACKLIST_CLEAR:
        case Mopidy.CONNECTION_ERROR:
        case Mopidy.MIXER_GET_VOLUME:
        case Mopidy.MIXER_SET_VOLUME:
        case Mopidy.PLAYBACK_GET_TIME_POSITION:
        case Mopidy.PLAYBACK_GET_STATE:
        case Mopidy.VALIDATION_ERROR:
        case Auth.AUTHENTICATION_TOKEN_INVALID:
          return resolve(data)
        default:
          return resolve(`skippedTransform: ${key}`)
      }
    })
  }
}

export default Transform
