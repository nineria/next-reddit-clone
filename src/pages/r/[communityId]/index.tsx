import { doc, getDoc } from 'firebase/firestore'
import { GetServerSidePropsContext } from 'next'
import React, { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import safeJsonStringify from 'safe-json-stringify'
import { Community, communityState } from '../../../atoms/communitiesAtom'
import About from '../../../components/Community/About'
import CreatePostLink from '../../../components/Community/CreatePostLink'
import Header from '../../../components/Community/Header'
import NotFound from '../../../components/Community/NotFound'
import PageContent from '../../../components/Layout/PageContent'
import Posts from '../../../components/Posts'
import { firestore } from '../../../firebase/clientApp'

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState)

  useEffect(() => {
    setCommunityStateValue((prev) => ({
      ...prev,
      currentCommunity: communityData,
    }))
  }, [communityData])

  if (!communityData) {
    return <NotFound />
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>

        <About communityData={communityData} />
      </PageContent>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get community data and pass it to client
  try {
    const communityDocRef = doc(
      firestore,
      'communities',
      context.query.communityId as string
    )
    const communityDoc = await getDoc(communityDocRef)

    return {
      props: {
        communityData: communityDoc.exists()
          ? await JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
            )
          : '',
      },
    }
  } catch (error: any) {
    // Could add error page here
    console.log('getServerSideProps Error: ', error.message)
    return {
      props: {},
    }
  }
}

export default CommunityPage
