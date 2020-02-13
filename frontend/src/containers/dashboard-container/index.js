import React, { useCallback, useEffect, useContext, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import SignInToken from 'utils/signin-token'
import GoogleAuthContext from 'contexts/google'
import * as actions from 'actions'
import * as searchActions from 'search/actions'
import Dashboard from 'dashboard'

export const DashboardContainer = () => {
  const jukebox = useSelector(state => state.jukebox)
  const tracklist = useSelector(state => state.tracklist)
  const currentTrack = useSelector(state => state.track)
  const dispatch = useDispatch()
  const { isSignedIn, googleUser } = useContext(GoogleAuthContext)
  const disable = !(isSignedIn && jukebox.mopidyOnline)
  const googleTokenId = useRef()
  const refreshTokenTimeoutID = useRef()
  const hasTokenChanged = (token) => token !== googleTokenId.current

  useEffect(() => {
    dispatch(actions.wsConnect())

    /* istanbul ignore next */
    return () => {
      dispatch(actions.wsDisconnect())
    }
  }, [dispatch])

  if (isSignedIn && hasTokenChanged(googleUser.tokenId)) {
    googleTokenId.current = googleUser.tokenId
    refreshTokenTimeoutID.current = SignInToken.refresh(googleUser, (token) => {
      dispatch(actions.updateToken(token))
    })
    dispatch(actions.updateToken(googleTokenId.current))
  }

  if (!isSignedIn) {
    googleTokenId.current = undefined
    SignInToken.clear(refreshTokenTimeoutID.current)
    dispatch(actions.clearToken())
  }

  const onPlay = useCallback(() => dispatch(actions.startPlaying()), [dispatch])
  const onStop = useCallback(() => dispatch(actions.stopPlaying()), [dispatch])
  const onPause = useCallback(() => dispatch(actions.pausePlaying()), [dispatch])
  const onNext = useCallback(() => dispatch(actions.nextPlaying()), [dispatch])
  const onPrevious = useCallback(() => dispatch(actions.previousPlaying()), [dispatch])
  const onVolumeChange = useCallback((evt) => dispatch(actions.setVolume(evt)), [dispatch])
  /* istanbul ignore next */
  const onDrop = useCallback((_item, monitor) => {
    if (monitor) {
      dispatch(actions.addNewTrack(monitor.getItem().urls[0]))
    }
  }, [dispatch])
  const onTracklistClear = useCallback(() => dispatch(actions.clearTrackList()), [dispatch])
  const onSearchClick = useCallback(() => dispatch(searchActions.toggleSearchSidebar(true)), [dispatch])
  const onRemoveTrack = useCallback((evt) => dispatch(actions.removeFromTracklist(evt)), [dispatch])
  const onArtistSearch = useCallback((query) => _ => {
    const searchOptions = { offset: 0 }
    dispatch(searchActions.search(query, searchOptions))
    dispatch(searchActions.storeSearchQuery(query, searchOptions))
    dispatch(searchActions.toggleSearchSidebar(true))
  }, [dispatch])

  return (
    <Dashboard
      online={jukebox.online}
      disabled={disable}
      onPlay={onPlay}
      onStop={onStop}
      onPause={onPause}
      onNext={onNext}
      onPrevious={onPrevious}
      onVolumeChange={onVolumeChange}
      onDrop={onDrop}
      onTracklistClear={onTracklistClear}
      onSearchClick={onSearchClick}
      tracklist={tracklist}
      currentTrack={currentTrack}
      onRemoveTrack={onRemoveTrack}
      onArtistSearch={onArtistSearch}
    />
  )
}

export default DragDropContext(HTML5Backend)(DashboardContainer)
