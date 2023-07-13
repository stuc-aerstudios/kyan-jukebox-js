import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import { Button, Image } from 'semantic-ui-react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import './index.css'
import { AuthContext } from 'contexts/google'

export const Settings = () => {
  const { user, setUser, profile, setProfile } = useContext(AuthContext)

  const login = useGoogleLogin({
    ux_mode: 'redirect',
    hosted_domain: process.env.GOOGLE_AUTH_DOMAIN,
    onSuccess: codeResponse => {
      console.log(codeResponse)
      setUser(codeResponse)
    },
    onError: error => console.log('Login Failed:', error),
    onNonOAuthError: error => console.log('NonOAuth Error:', error)
  })

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json'
          }
        })
        .then(res => {
          setProfile(res.data)
        })
        .catch(err => console.log(err))
    }
  }, [user, setProfile])

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout()
    setProfile(null)
  }

  let avatar = (
    <Button
      icon='power off'
      floated='right'
      onClick={() => login()}
      className='jb-settings-toggle'
      title='Login using Google'
    />
  )
  if (profile) {
    avatar = (
      <Image
        rounded
        size='mini'
        floated='right'
        title={profile.name}
        src={profile.picture}
        onClick={() => logOut()}
      />
    )
  }

  return <React.Fragment>{avatar}</React.Fragment>
}

export default Settings
