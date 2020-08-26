import { Schema, Document, model } from 'mongoose'
import logger from '../config/logger'
import Mopidy from 'mopidy'
import { JBTrackInterface } from './track'

const HOW_MANY_PREVIOUS_TRACKS_IN_PLAYLIST = 4 as const

export interface DBSettingValueInterface {
  trackSeeds: string[]
  currentTrack: string
  currentTracklist: string[]
}

export interface DBSettingInterface extends Document {
  key: string
  value: DBSettingValueInterface
}

const settingSchema = new Schema({
  key: Schema.Types.String,
  value: Schema.Types.Mixed
})
const Setting = model<DBSettingInterface>('Setting', settingSchema)
const stateFind = { key: 'state' }
const options = { upsert: true, runValidators: true, setDefaultsOnInsert: true }

const addToTrackSeedList = (track: JBTrackInterface): Promise<void | string> => {
  if (track.metrics && track.metrics.votes > 1 && track.metrics.votesAverage < 50)
    return Promise.resolve()
  if (track.metrics && track.metrics.plays > 2 && track.metrics.votes < 1)
    return Promise.resolve()

  return new Promise((resolve) => {
    return Setting.findOne(stateFind)
      .then((state) => {
        const seeds = new Set(state.value.trackSeeds)
        seeds.add(track.uri)
        state.value.trackSeeds = Array.from(seeds)
        state.markModified('value.trackSeeds')
        return state.save()
      })
      .then(() => resolve(track.uri))
      .catch((error) => logger.error('addToTrackSeedList', { args: error.message }))
  })
}

const clearState = (): Promise<void> =>
  new Promise((resolve) => {
    return Setting.collection
      .findOneAndReplace(stateFind, stateFind, options)
      .then(() => resolve())
      .catch((error) => logger.error('clearState', { args: error.message }))
  })

const initializeState = (
  currentTrack: Mopidy.models.Track | null,
  currentTracklist: Mopidy.models.Track[]
): Promise<void> =>
  new Promise((resolve) => {
    const emptyTrackSeeds: string[] = []
    const updateValue = {
      ...stateFind,
      value: {
        currentTrack: currentTrack ? currentTrack.uri : null,
        currentTracklist: currentTracklist.map((track) => track.uri),
        trackSeeds: emptyTrackSeeds
      }
    }
    return Setting.collection
      .findOneAndReplace(stateFind, updateValue, options)
      .then(() => resolve())
      .catch((error) => logger.error('initializeState', { args: error.message }))
  })

const trimTracklist = (mopidy: Mopidy): Promise<boolean> =>
  new Promise((resolve) => {
    return Setting.findOne(stateFind)
      .then((state) => {
        const { currentTrack, currentTracklist } = state.value
        const currentTrackIndex = currentTracklist.indexOf(currentTrack)

        if (currentTrackIndex > HOW_MANY_PREVIOUS_TRACKS_IN_PLAYLIST) {
          const indexToDeleteTo = currentTrackIndex - HOW_MANY_PREVIOUS_TRACKS_IN_PLAYLIST
          const tracksToTrim = currentTracklist.slice(0, indexToDeleteTo)
          const updateValue = {
            $set: {
              'value.currentTracklist': currentTracklist.slice(indexToDeleteTo)
            }
          }

          return Setting.findOneAndUpdate(stateFind, updateValue, options).then(() => {
            logger.info('trimTracklist', { args: tracksToTrim })

            return mopidy.tracklist
              .remove({ criteria: { uri: tracksToTrim } })
              .then(() => resolve(true))
          })
        }

        return resolve(false)
      })
      .catch((error) => logger.error('trimTracklist', { args: error.message }))
  })

const updateCurrentTrack = (uri: string): Promise<string> =>
  new Promise((resolve) => {
    const updateValue = { $set: { 'value.currentTrack': uri } }
    return Setting.findOneAndUpdate(stateFind, updateValue, options)
      .then(() => resolve(uri))
      .catch((error) => logger.error('updateCurrentTrack', { args: error.message }))
  })

const updateTracklist = (uris: ReadonlyArray<string>): Promise<ReadonlyArray<string>> =>
  new Promise((resolve) => {
    const updateValue = { $set: { 'value.currentTracklist': uris } }
    return Setting.findOneAndUpdate(stateFind, updateValue, options)
      .then(() => resolve(uris))
      .catch((error) => logger.error('updateTracklist', { args: error.message }))
  })

const removeFromSeeds = (uri: string): Promise<string> =>
  new Promise((resolve) => {
    const updateValue = { $pull: { 'value.trackSeeds': uri } }
    return Setting.findOneAndUpdate(stateFind, updateValue, options)
      .then(() => resolve(uri))
      .catch((error) => logger.error('removeFromSeeds', { args: error.message }))
  })

const getSeedTracks = (): Promise<string[]> =>
  new Promise((resolve) => {
    return Setting.findOne(stateFind)
      .then((state) => resolve(state.value.trackSeeds || []))
      .catch((error) => logger.error('getSeedTracks', { args: error.message }))
  })

const getTracklist = (): Promise<string[]> =>
  new Promise((resolve) => {
    return Setting.findOne(stateFind)
      .then((state) => resolve(state.value.currentTracklist || []))
      .catch((error) => logger.error('getTracklist', { args: error.message }))
  })

export default Setting
export {
  addToTrackSeedList,
  clearState,
  getSeedTracks,
  getTracklist,
  initializeState,
  removeFromSeeds,
  trimTracklist,
  updateCurrentTrack,
  updateTracklist
}
