import { Stack } from '@chakra-ui/react'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Post } from '../atoms/postsAtom'
import CreatePostLink from '../components/Community/CreatePostLink'
import PageContent from '../components/Layout/PageContent'
import PostItem from '../components/Posts/PostItem'
import PostLoader from '../components/Posts/PostLoader'
import { auth, firestore } from '../firebase/clientApp'
import useCommunityData from '../hooks/useCommunityData'
import usePosts from '../hooks/usePosts'

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletePost,
    onVote,
  } = usePosts()
  const { communityStateValue } = useCommunityData()

  const getUserHomePosts = async () => {
    setLoading(true)
    try {
      if (communityStateValue.mySnippets.length) {
        // get posts from user's communities
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        )
        const postQuery = query(
          collection(firestore, 'posts'),
          where('communityId', 'in', myCommunityIds),
          limit(10)
        )
        const postDocs = await getDocs(postQuery)
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }))
      } else {
        getNoUserHomePosts()
      }
    } catch (error) {
      console.log('getUserHomePosts error: ', error)
    }
    setLoading(false)
  }

  const getNoUserHomePosts = async () => {
    setLoading(true)
    try {
      //
      const postQuery = query(
        collection(firestore, 'posts'),
        orderBy('voteStatus', 'desc'),
        limit(10)
      )

      const postDoc = await getDocs(postQuery)
      const posts = postDoc.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // set postState
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }))
    } catch (error) {
      console.log('buildNoUserHomeFeed error: ', error)
    }
    setLoading(false)
  }

  const getUserPostVotes = () => {}

  // useEffects
  useEffect(() => {
    if (communityStateValue.snippetsFetched) getUserHomePosts()
  }, [communityStateValue.snippetsFetched])

  useEffect(() => {
    if (!user && !loadingUser) {
      getNoUserHomePosts()
    }
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
          <>
            <CreatePostLink />
            {loading ? (
              <PostLoader />
            ) : (
              <Stack>
                {postStateValue.posts.map((post: Post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    onVote={onVote}
                    onDeletePost={onDeletePost}
                    userVoteValue={
                      postStateValue.postVotes.find(
                        (item) => item.postId === post.id
                      )?.voteValue
                    }
                    userIsCreator={user?.uid === post.creatorId}
                    onSelectPost={onSelectPost}
                    homePage
                  />
                ))}
              </Stack>
            )}
          </>
          {/* <Recommendations /> */}
          <></>
        </PageContent>
      </main>
    </div>
  )
}

export default Home
