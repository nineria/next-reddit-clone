import { doc, getDoc } from 'firebase/firestore'
import { GetServerSidePropsContext } from 'next'
import React from 'react'
import safeJsonStringify from 'safe-json-stringify'
import { Community } from '../../../atoms/communitiesAtom'
import Header from '../../../components/Community/Header'
import CommunityNotFound from '../../../components/Community/NotFound'
import { firestore } from '../../../firebase/clientApp'
type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  if (!communityData) {
    return <CommunityNotFound />
  }
  return (
    <>
      <Header communityData={communityData} />
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
          ? JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data })
            )
          : '',
      },
    }
  } catch (error) {
    // Could add error page here
    console.log('getServerSideProps Error: ' + error)
  }
}

export default CommunityPage
