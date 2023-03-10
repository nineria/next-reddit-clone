import {
  collection,
  doc,
  getDocs,
  increment,
  writeBatch,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { authModalState } from '../atoms/authModalAtom'
import {
  Community,
  CommunitySnippet,
  communityState,
} from '../atoms/communitiesAtom'
import { auth, firestore } from '../firebase/clientApp'

const useCommunityData = () => {
  const [user] = useAuthState(auth)
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState)
  const setAuthModalState = useSetRecoilState(authModalState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // is the user sign in?
    // if not => open auth model
    if (!user) {
      // open modal
      setAuthModalState({ open: true, view: 'login' })
      return
    }

    if (isJoined) {
      leaveCommunity(communityData.id)
      return
    }

    joinCommunity(communityData)
  }

  const getMySnippets = async () => {
    setLoading(true)
    try {
      // get user snippets
      const snippetsDoc = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      )

      const snippets = snippetsDoc.docs.map((doc) => ({ ...doc.data() }))
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }))

      // setCommunityStateValue()
    } catch (error: any) {
      console.log('getMySnippets Error: ', error.message)
      setError(error.message)
    }
    setLoading(false)
  }

  const joinCommunity = async (communityData: Community) => {
    // batch write
    try {
      const batch = writeBatch(firestore)

      // creating a new community snippet
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || '',
      }

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      )

      // updating the number of numberOfMembers (+1)

      batch.update(doc(firestore, 'communities', communityData.id), {
        numberOfMembers: increment(1),
      })

      await batch.commit()

      // update recoil state - communityState.mySnippets
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }))

      setLoading(false)
    } catch (error: any) {
      console.log('joinCommunity Error: ', error.message)
      setError(error.message)
    }
  }

  const leaveCommunity = async (communityId: string) => {
    // batch write
    try {
      const batch = writeBatch(firestore)

      // deleting a new community snippet from user
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      )

      // updating the number of numberOfMembers (-1)

      batch.update(doc(firestore, 'communities', communityId), {
        numberOfMembers: increment(-1),
      })

      await batch.commit()

      // update recoil state - communityState.mySnippets
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }))
    } catch (error: any) {
      console.log('leaveCommunity Error: ', error.message)
      setError(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user) {
      return setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
      }))
    }
    getMySnippets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return {
    // data and function
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  }
}
export default useCommunityData
