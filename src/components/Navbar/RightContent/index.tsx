import { Flex } from '@chakra-ui/react'
import { User } from 'firebase/auth'
import React from 'react'
import AuthModal from '../../Modal/Auth'
import AuthButtons from './AuthButtons'
import Icons from './Icons'
import UserMenu from './UserMenu'

type indexProps = {
  user?: User | null
}

const RightContent: React.FC<indexProps> = ({ user }) => {
  return (
    <>
      <AuthModal />
      <Flex justify='center' align='center'>
        {user && <Icons />}
        {!user && <AuthButtons />}
        <UserMenu user={user} />
      </Flex>
    </>
  )
}
export default RightContent
