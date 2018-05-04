import React from 'react'
import SkipButtons from '../../components/skip-buttons'
import MopidyApi from '../../constants/mopidy-api'
import PropTypes from 'prop-types'
import { Button, Icon } from 'semantic-ui-react'

const playButton = (cb, state, disabled) => (
  <Button
    onClick={cb}
    animated='vertical'
    disabled={(state === MopidyApi.PLAYING || disabled)}
    active={(state === MopidyApi.PLAYING)}
    className='jb-play-button'
  >
    <Button.Content hidden>Play</Button.Content>
    <Button.Content visible>
      <Icon name='play' />
    </Button.Content>
  </Button>
)

const pauseButton = (cb, state, disabled) => (
  <Button
    onClick={cb}
    animated='vertical'
    disabled={(state === MopidyApi.PAUSED || disabled)}
    active={(state === MopidyApi.PAUSED)}
    className='jb-pause-button'
  >
    <Button.Content hidden>Pause</Button.Content>
    <Button.Content visible>
      <Icon name='pause' />
    </Button.Content>
  </Button>
)

const Controls = ({ disabled, state, onPlay, onPause, onPrevious, onNext }) => {
  return (
    <span>
      <SkipButtons
        disabled={disabled}
        onPrevious={onPrevious}
        onNext={onNext}
      />
      {playButton(onPlay, state, disabled)}
      {pauseButton(onPause, state, disabled)}
    </span>
  )
}

Controls.propTypes = {
  disabled: PropTypes.bool,
  state: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
}

export default Controls
