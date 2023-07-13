import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import ReactNotification from 'react-notifications-component'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ErrorBoundary from 'components/error-boundary'
import jukeboxMiddleware from 'middleware/jukebox-middleware'
import jukeboxApp from 'reducers'
import DashboardContainer from 'containers/dashboard-container'
import 'react-notifications-component/dist/theme.css'
import { AuthProvider } from 'contexts/google'

const store = createStore(jukeboxApp, composeWithDevTools(applyMiddleware(jukeboxMiddleware)))

const App = () => {
  return (
    <Provider store={store}>
      <ReactNotification />
      <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID as string}>
        <AuthProvider>
          <ErrorBoundary>
            <DashboardContainer />
          </ErrorBoundary>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Provider>
  )
}

export default App
