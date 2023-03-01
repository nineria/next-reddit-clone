import { Button, Stack } from '@chakra-ui/react'
import React from 'react'
import { useSetRecoilState } from 'recoil'
import { authModalState } from '../../../atoms/authModalAtom'

const AuthButtons: React.FC = () => {
  const setAuthModalState = useSetRecoilState(authModalState)
  return (
    <Stack direction='row'>
      <Button
        variant='outline'
        height='28px'
        mr={2}
        width={{ base: '70px', md: '110px' }}
        display={{ base: 'none', sm: 'flex' }}
        onClick={() => setAuthModalState({ open: true, view: 'login' })}
      >
        Log In
      </Button>
      <Button
        height='28px'
        mr={2}
        width={{ base: '70px', md: '110px' }}
        display={{ base: 'none', sm: 'flex' }}
        onClick={() => setAuthModalState({ open: true, view: 'signup' })}
      >
        Sign Up
      </Button>
    </Stack>
  )
}
export default AuthButtons
