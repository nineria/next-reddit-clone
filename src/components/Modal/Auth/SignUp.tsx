import { Button, Flex, Input, Text } from '@chakra-ui/react'
import { User } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { useSetRecoilState } from 'recoil'
import { authModalState, ModalView } from '../../../atoms/authModalAtom'
import { auth, firestore } from '../../../firebase/clientApp'
import { FIREBASE_ERROR } from '../../../firebase/errors'

type SignUpProps = {
  toggleView: (view: ModalView) => void
}

const SignUp: React.FC<SignUpProps> = ({ toggleView }) => {
  const setAuthModalState = useSetRecoilState(authModalState)
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formError, setFormError] = useState('')
  const [createUserWithEmailAndPassword, userCred, loading, userError] =
    useCreateUserWithEmailAndPassword(auth)

  // Firebase
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (formError) setFormError('')
    if (!form.email.includes('@')) {
      return setFormError('Press enter a valid email')
    }

    if (form.password !== form.confirmPassword) {
      return setFormError('Password do not match')
    }

    // valid form inputs
    createUserWithEmailAndPassword(form.email, form.password)
  }

  const onChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const createUserDocument = async (user: User) => {
    const userDocRef = doc(firestore, 'users', user.uid)
    await setDoc(userDocRef, JSON.parse(JSON.stringify(user)))
  }

  useEffect(() => {
    if (userCred) {
      createUserDocument(userCred.user)
    }
  }, [userCred])

  return (
    <form onSubmit={onSubmit}>
      <Input
        required
        name='email'
        placeholder='Email'
        type='text'
        mb={2}
        fontSize='10pt'
        _placeholder={{ color: 'gray.500' }}
        _hover={{
          bg: 'white',
          border: '1px solid',
          borderColor: 'blue.500',
        }}
        _focus={{
          outline: 'none',
          bg: 'white',
          border: '1px solid',
          borderColor: 'blue.500',
        }}
        bg='gray.50'
        onChange={onChange}
      />
      <Input
        required
        name='password'
        placeholder='Password'
        type='password'
        fontSize='10pt'
        mb={2}
        _placeholder={{ color: 'gray.500' }}
        _hover={{
          bg: 'white',
          border: '1px solid',
          borderColor: 'blue.500',
        }}
        _focus={{
          outline: 'none',
          bg: 'white',
          border: '1px solid',
          borderColor: 'blue.500',
        }}
        bg='gray.50'
        onChange={onChange}
      />
      <Input
        required
        name='confirmPassword'
        placeholder='Confirm Password'
        type='password'
        fontSize='10pt'
        mb={2}
        _placeholder={{ color: 'gray.500' }}
        _hover={{
          bg: 'white',
          border: '1px solid',
          borderColor: 'blue.500',
        }}
        _focus={{
          outline: 'none',
          bg: 'white',
          border: '1px solid',
          borderColor: 'blue.500',
        }}
        bg='gray.50'
        onChange={onChange}
      />
      <Text textAlign='center' color='red' fontSize='10pt'>
        {formError ||
          FIREBASE_ERROR[userError?.message as keyof typeof FIREBASE_ERROR]}
      </Text>
      <Button
        type='submit'
        width='100%'
        height='36px'
        my={2}
        isLoading={loading}
      >
        Sign Up
      </Button>
      <Flex fontSize='9pt' justifyContent='center'>
        <Text mr={1}>Already a redditor?</Text>
        <Text
          color='blue.500'
          fontWeight={400}
          cursor='pointer'
          onClick={() => toggleView('login')}
        >
          LOG IN
        </Text>
      </Flex>
    </form>
  )
}
export default SignUp
