import reducer from './index'
import Types from '../../constants'

describe('jukebox', () => {
  it('handles default state', () => {
    expect(reducer(undefined, {})).toEqual({
      currentVolume: 0,
      online: false
    })
  })

  it('handles a CONNECTED', () => {
    expect(reducer(undefined, {
      type: Types.CONNECTED
    })).toEqual({
      currentVolume: 0,
      online: true
    })
  })

  it('handles a DISCONNECTED', () => {
    expect(reducer({ online: true }, {
      type: Types.DISCONNECTED
    })).toEqual({ online: false })
  })

  it('handles a UPDATE_VOLUME', () => {
    expect(reducer(undefined, {
      type: Types.UPDATE_VOLUME,
      volume: 32
    })).toEqual({
      currentVolume: 32,
      online: false
    })
  })

  it('handles a UPDATE_VOLUME increased', () => {
    const state = {
      currentVolume: 10,
      online: false
    }
    expect(reducer(state, {
      type: Types.UPDATE_VOLUME,
      volume: 32
    })).toEqual({
      currentVolume: 32,
      online: false
    })
  })

  it('handles a UPDATE_VOLUME decreased', () => {
    const state = {
      currentVolume: 10,
      online: false
    }
    expect(reducer(state, {
      type: Types.UPDATE_VOLUME,
      volume: 5
    })).toEqual({
      currentVolume: 5,
      online: false
    })
  })
})
