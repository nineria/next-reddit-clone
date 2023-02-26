import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { BsFillEyeFill, BsFillPersonFill } from 'react-icons/bs'
import { HiLockClosed } from 'react-icons/hi'
import { auth, firestore } from '../../../firebase/clientApp'

type CreateCommunityModalProps = {
  open: boolean
  handleClose: () => void
  userId: string
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose,
  userId,
}) => {
  const [user] = useAuthState(auth)
  const [name, setName] = useState('')
  const [charsRemaining, setCharsRemaining] = useState(21)
  const [communityType, setCommunityType] = useState('public')
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (value.length > 21) return
    setName(value)
    setCharsRemaining(21 - value.length)
  }

  const onCommunityTypeChange = ({
    target: { name },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setCommunityType(name)
  }

  const handleCreateCommunity = async () => {
    if (nameError) setNameError('')
    // validate community name
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    if (format.test(name) || name.length < 3) {
      setNameError(
        'Community name must be between 3-21 characters, and can only contain letter, number, or underscored'
      )
      return
    }

    setLoading(true)

    try {
      const communityDocRef = doc(firestore, 'communities', name)

      await runTransaction(firestore, async (transaction) => {
        // Check if community exists in db
        const communityDoc = await transaction.get(communityDocRef)
        if (communityDoc.exists()) {
          throw new Error(`Sorry, r/${name} is taken, Try another`)
        }

        // create community
        transaction.set(communityDocRef, {
          creatorId: userId,
          createdAt: serverTimestamp(),
          numberOfMember: 1,
          privacyType: communityType,
        })

        // create communitySnippets on user
        transaction.set(
          doc(firestore, `users/${userId}/communitySnippets`, name),
          {
            communityId: name,
            isModerator: true,
          }
        )
      })
    } catch (error: any) {
      console.log('handleCreateCommunity Error: ', error.message)
      setNameError(error.message)
    }

    setLoading(false)
  }

  return (
    <>
      <Modal isOpen={open} onClose={handleClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display='flex'
            flexDir='column'
            fontSize={15}
            padding={2}
          >
            Create a community
          </ModalHeader>
          <Box>
            <ModalCloseButton />
            <ModalBody display='flex' flexDir='column' px='10px'>
              <Text fontWeight={600} fontSize={15}>
                Name
              </Text>
              <Text fontSize={11} color='gray.500'>
                Community name including capitalization cannot be changed
              </Text>
              <Text
                position='relative'
                top='28px'
                left='10px'
                width='20px'
                color='gray.400'
              >
                r/
              </Text>
              <Input
                position='relative'
                value={name}
                size='sm'
                pl='22px'
                onChange={handleChange}
              />
              <Text
                fontSize='9pt'
                color={charsRemaining === 0 ? 'red' : 'gray.500'}
              >
                {charsRemaining} Characters remaining
              </Text>
              <Text fontSize='9pt' color='red' pt={1}>
                {nameError}
              </Text>
              <Box my={4}>
                <Text fontWeight={600} fontSize={15}>
                  Community Type
                </Text>
                {/* checkbox */}
                <Stack spacing={2}>
                  <Checkbox
                    name='public'
                    isChecked={communityType === 'public'}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align='center'>
                      <Icon as={BsFillPersonFill} color='gray.500' mr={2} />
                      <Text fontSize='10pt' mr={1}>
                        Public
                      </Text>
                      <Text fontSize='8pt' color='gray.500'>
                        Anyone can view, post, and comment to this community
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Checkbox
                    name='restricted'
                    isChecked={communityType === 'restricted'}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align='center'>
                      <Icon as={BsFillEyeFill} color='gray.500' mr={2} />
                      <Text fontSize='10pt' mr={1}>
                        Restricted
                      </Text>
                      <Text fontSize='8pt' color='gray.500'>
                        Anyone can view this community, but only approved users
                        can post
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Checkbox
                    name='private'
                    isChecked={communityType === 'private'}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align='center'>
                      <Icon as={HiLockClosed} color='gray.500' mr={2} />
                      <Text fontSize='10pt' mr={1}>
                        Private
                      </Text>
                      <Text fontSize='8pt' color='gray.500'>
                        Only approved users can view and submit to this
                        community
                      </Text>
                    </Flex>
                  </Checkbox>
                </Stack>
              </Box>
            </ModalBody>
          </Box>

          <ModalFooter bg='gray.100' borderRadius='0px 0px 10px 10px'>
            <Button
              variant='outline'
              height='30px'
              colorScheme='blue'
              mr={3}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              height='30px'
              onClick={handleCreateCommunity}
              isLoading={loading}
            >
              Create Community
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
export default CreateCommunityModal
