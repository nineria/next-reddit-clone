import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import PageContent from '../../../../components/Layout/PageContent'
import PostItem from '../../../../components/Posts/PostItem'
import { auth } from '../../../../firebase/clientApp'
import usePosts from '../../../../hooks/usePosts'

const PostPage: React.FC = () => {
  const { postStateValue, setPostStateValue, onDeletePost, onVote } = usePosts()
  const [user] = useAuthState(auth)
  return (
    <PageContent>
      <>
        {postStateValue.selectedPost && (
          <PostItem
            post={postStateValue.selectedPost}
            onVote={onVote}
            onDeletePost={onDeletePost}
            userVoteValue={
              postStateValue.postVotes.find(
                (item) => item.postId === postStateValue.selectedPost?.id
              )?.voteValue
            }
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />
        )}
        {/* SelectedPost => postItem*/}
        {/* Comments */}
      </>
      <>{/* About */}</>
    </PageContent>
  )
}

export default PostPage
