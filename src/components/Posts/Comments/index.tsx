import { Box, Flex } from '@chakra-ui/react'
import { User } from 'firebase/auth'
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { Post, postState } from '../../../atoms/postsAtom'
import { firestore } from '../../../firebase/clientApp'
import CommentInput from './CommentInput'

type CommentsProps = {
  user: User
  selectedPost: Post | null
  communityId: string
}

export type Comment = {
  id: string
  creatorId: string
  creatorDisplayText: string
  communityId: string
  postId: string
  postTitle: string
  text: string
  createdAt: Timestamp
}

const Comments: React.FC<CommentsProps> = ({
  user,
  selectedPost,
  communityId,
}) => {
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const setPostState = useSetRecoilState(postState)

  const onCreateComment = async () => {
    setLoading(true)
    try {
      const batch = writeBatch(firestore)

      // create comment document
      const commentDocRef = doc(collection(firestore, 'comments'))

      const newComment: Comment = {
        id: commentDocRef.id,
        creatorId: user.uid,
        creatorDisplayText: user.email!.split('@')[0],
        communityId,
        postId: selectedPost?.id!,
        postTitle: selectedPost?.title!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp,
      }

      batch.set(commentDocRef, newComment)

      // update post numberOfComments + 1
      const postDocRef = doc(firestore, 'posts', selectedPost?.id!)
      batch.update(postDocRef, {
        numberOfComments: increment(1),
      })

      await batch.commit()
      // update client recoil state
      setCommentText('')
      setComments((prev) => [newComment, ...prev])
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      }))
    } catch (error: any) {
      console.log('onCreateComment error: ', error.message)
    }
    setLoading(false)
  }

  const onDeleteComment = async (comment: any) => {
    // delete comment document
    // update post numberOfComments - 1
    // update client recoil state
  }

  const getPostComments = async () => {}

  useEffect(() => {
    getPostComments()
  }, [])

  return (
    <Box bg='white' borderRadius='0px 0px 4px 4px' p={2}>
      <Flex
        direction='column'
        pl={10}
        pr={4}
        mb={6}
        fontSize='10pt'
        width='100%'
      >
        <CommentInput
          commentText={commentText}
          setCommentText={setCommentText}
          user={user}
          loading={loading}
          onCreateComment={onCreateComment}
        />
      </Flex>
    </Box>
  )
}
export default Comments