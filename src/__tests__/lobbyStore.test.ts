import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFsTransferGMRole, mockSubscribeToMessages, mockSubscribeToMembers, mockFsUpdateLastSeen, mockFsGetMemberCharacterId, mockFsGetUserLobbies } =
  vi.hoisted(() => ({
    mockFsTransferGMRole: vi.fn(),
    mockSubscribeToMessages: vi.fn(),
    mockSubscribeToMembers: vi.fn(),
    mockFsUpdateLastSeen: vi.fn(),
    mockFsGetMemberCharacterId: vi.fn(),
    mockFsGetUserLobbies: vi.fn(() => Promise.resolve([])),
  }))

vi.mock('../lib/lobbySync', () => ({
  createLobby: vi.fn(),
  joinLobbyByCode: vi.fn(),
  leaveLobby: vi.fn(),
  closeLobby: vi.fn(),
  sendMessage: vi.fn(),
  updateLastSeen: mockFsUpdateLastSeen,
  getUserLobbies: mockFsGetUserLobbies,
  getMemberCharacterId: mockFsGetMemberCharacterId,
  setActiveCharacter: vi.fn(),
  transferGMRole: mockFsTransferGMRole,
  subscribeToMessages: mockSubscribeToMessages,
  subscribeToMembers: mockSubscribeToMembers,
}))

import { useLobbyStore } from '../store/lobbyStore'
import { createLobby as fsCreateLobby, joinLobbyByCode as fsJoin } from '../lib/lobbySync'
import type { Lobby, LobbyMessage } from '../types'

function makeLobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    id: 'lobby-1',
    code: 'ABC123',
    name: 'Test',
    ownerId: 'owner-uid',
    ownerName: 'Owner',
    createdAt: 1000,
    isActive: true,
    gmUid: 'gm-uid',
    ...overrides,
  }
}

function makeMsg(id: string, overrides: Partial<LobbyMessage> = {}): LobbyMessage {
  return { id, senderId: 'user-1', senderName: 'User', content: 'Ciao', sentAt: 1000, type: 'text', ...overrides }
}

describe('lobbyStore — creazione e adesione', () => {
  beforeEach(() => {
    useLobbyStore.getState().clearStore()
    vi.clearAllMocks()
    mockFsGetUserLobbies.mockResolvedValue([])
  })

  it('createLobby delega a lobbySync e ricarica le lobby dell’utente', async () => {
    const lobby = makeLobby()
    ;(fsCreateLobby as ReturnType<typeof vi.fn>).mockResolvedValue(lobby)

    const result = await useLobbyStore.getState().createLobby('owner-uid', 'Owner', 'Test')

    expect(fsCreateLobby).toHaveBeenCalledWith('owner-uid', 'Owner', 'Test')
    expect(result).toEqual(lobby)
    expect(mockFsGetUserLobbies).toHaveBeenCalledWith('owner-uid')
  })

  it('joinLobby delega a lobbySync e ricarica le lobby dell’utente', async () => {
    const lobby = makeLobby({ ownerId: 'other-uid' })
    ;(fsJoin as ReturnType<typeof vi.fn>).mockResolvedValue(lobby)

    const result = await useLobbyStore.getState().joinLobby('player-uid', 'Player', 'ABC123')

    expect(fsJoin).toHaveBeenCalledWith('player-uid', 'Player', 'ABC123')
    expect(result).toEqual(lobby)
    expect(mockFsGetUserLobbies).toHaveBeenCalledWith('player-uid')
  })

  it('propaga l’errore e lo espone in `error` se lobbySync rifiuta', async () => {
    ;(fsJoin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Lobby non trovata o non attiva.'))

    await expect(useLobbyStore.getState().joinLobby('player-uid', 'Player', 'ZZZZZZ')).rejects.toThrow('Lobby non trovata')
    expect(useLobbyStore.getState().error).toBe('Lobby non trovata o non attiva.')
  })
})

describe('lobbyStore — filtro messaggi nascosti per ruolo', () => {
  let capturedCallback: ((msgs: LobbyMessage[]) => void) | null = null

  beforeEach(() => {
    useLobbyStore.getState().clearStore()
    vi.clearAllMocks()
    mockFsGetMemberCharacterId.mockResolvedValue(null)
    mockFsUpdateLastSeen.mockResolvedValue(undefined)
    mockSubscribeToMembers.mockReturnValue(vi.fn())
    mockSubscribeToMessages.mockImplementation((_lobbyId: string, cb: (msgs: LobbyMessage[]) => void) => {
      capturedCallback = cb
      return vi.fn()
    })
  })

  it('i messaggi nascosti altrui sono filtrati per i membri non-GM', () => {
    const lobby = makeLobby({ gmUid: 'gm-uid' })
    useLobbyStore.getState().openLobby('player-uid', lobby)

    capturedCallback!([makeMsg('1'), makeMsg('2', { senderId: 'gm-uid', hidden: true, type: 'roll' }), makeMsg('3', { senderId: 'player-uid' })])

    const stored = useLobbyStore.getState().messages
    expect(stored).toHaveLength(2)
    expect(stored.find((m) => m.id === '2')).toBeUndefined()
  })

  it('il GM vede i propri messaggi nascosti', () => {
    const lobby = makeLobby({ gmUid: 'gm-uid' })
    useLobbyStore.getState().openLobby('gm-uid', lobby)

    capturedCallback!([makeMsg('1'), makeMsg('2', { senderId: 'gm-uid', hidden: true, type: 'roll' })])

    expect(useLobbyStore.getState().messages).toHaveLength(2)
  })
})

describe('lobbyStore — transferGMRole', () => {
  beforeEach(() => {
    useLobbyStore.getState().clearStore()
    vi.clearAllMocks()
    mockFsGetMemberCharacterId.mockResolvedValue(null)
    mockFsUpdateLastSeen.mockResolvedValue(undefined)
    mockSubscribeToMembers.mockReturnValue(vi.fn())
    mockSubscribeToMessages.mockReturnValue(vi.fn())
  })

  it('aggiorna gmUid in activeLobby dopo il trasferimento', async () => {
    const lobby = makeLobby({ gmUid: 'gm-uid' })
    useLobbyStore.getState().openLobby('gm-uid', lobby)

    mockFsTransferGMRole.mockResolvedValue(undefined)
    await useLobbyStore.getState().transferGMRole('gm-uid', 'lobby-1', 'new-gm-uid')

    expect(useLobbyStore.getState().activeLobby?.gmUid).toBe('new-gm-uid')
  })
})
