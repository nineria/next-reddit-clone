import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import PageContent from '../components/Layout/PageContent'
import { auth } from '../firebase/clientApp'

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth)

  const buildUserHomeFeed = () => {}

  const buildNoUserHomeFeed = () => {}

  const getUserPostVotes = () => {}

  // useEffects
  useEffect(() => {
    // no user and not in loadingUser state
    if (!user && !loadingUser) buildNoUserHomeFeed()
  }, [user, loadingUser])

  return (
    <div>
      <Head>
        <title>Reddit - Drive in to anything</title>
        <meta
          name='description'
          content="Reddit is a network of communities where people can dive into their interests, hobbies and passions. There's a community for whatever you're interested in ... by create next app"
        />
        <link rel='icon' href='/images/reddit.svg' />
      </Head>

      <main>
        <PageContent>
          {/* <PostFeed /> */}
          {/* <Recommendations /> */}
        </PageContent>
      </main>
    </div>
  )
}

export default Home
