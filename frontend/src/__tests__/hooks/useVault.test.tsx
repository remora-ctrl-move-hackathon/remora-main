import { renderHook, act, waitFor } from '@testing-library/react'
import { useVault } from '@/hooks/useVault'
import { VaultService } from '@/services/vault.service'
import toast from 'react-hot-toast'

// Mock dependencies
jest.mock('@/services/vault.service')
jest.mock('react-hot-toast')

const mockSignAndSubmitTransaction = jest.fn()
jest.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => ({
    account: { address: '0x123' },
    connected: true,
    signAndSubmitTransaction: mockSignAndSubmitTransaction,
  }),
}))

describe('useVault', () => {
  let mockVaultService: jest.Mocked<VaultService>

  beforeEach(() => {
    mockVaultService = new VaultService() as jest.Mocked<VaultService>
    ;(VaultService as jest.Mock).mockImplementation(() => mockVaultService)
    
    mockVaultService.getUserVaults.mockResolvedValue([1, 2])
    mockVaultService.getManagedVaults.mockResolvedValue([3, 4])
    mockVaultService.getVault.mockImplementation((id) => 
      Promise.resolve({
        vaultId: id,
        name: `Vault ${id}`,
        description: 'Test vault',
        manager: id === 3 || id === 4 ? '0x123' : '0x456',
        totalValue: 1000,
        totalShares: 100,
        managementFee: 2,
        performanceFee: 20,
        minDeposit: 10,
        status: 1,
        createdAt: Date.now(),
      })
    )
    
    mockSignAndSubmitTransaction.mockResolvedValue({ hash: '0xabc' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchUserVaults', () => {
    it('should fetch and organize user vaults correctly', async () => {
      const { result } = renderHook(() => useVault())

      await waitFor(() => {
        expect(result.current.userVaults).toHaveLength(2)
        expect(result.current.managedVaults).toHaveLength(2)
      })

      expect(result.current.userVaults[0].vaultId).toBe(1)
      expect(result.current.managedVaults[0].vaultId).toBe(3)
    })

    it('should handle errors gracefully', async () => {
      mockVaultService.getUserVaults.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useVault())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to fetch vaults')
    })
  })

  describe('createVault', () => {
    it('should create vault and show success message', async () => {
      const mockPayload = { data: 'mock-payload' }
      mockVaultService.createVault.mockResolvedValue(mockPayload)

      const { result } = renderHook(() => useVault())

      await act(async () => {
        await result.current.createVault({
          name: 'New Vault',
          description: 'Test',
          managementFee: 2,
          performanceFee: 20,
          minDeposit: 100,
        })
      })

      expect(mockSignAndSubmitTransaction).toHaveBeenCalledWith({ data: mockPayload })
      expect(toast.success).toHaveBeenCalledWith('Vault created successfully!')
    })

    it('should show error when wallet not connected', async () => {
      jest.spyOn(require('@aptos-labs/wallet-adapter-react'), 'useWallet').mockReturnValue({
        account: null,
        connected: false,
      })

      const { result } = renderHook(() => useVault())

      await act(async () => {
        await result.current.createVault({
          name: 'New Vault',
          description: 'Test',
          managementFee: 2,
          performanceFee: 20,
          minDeposit: 100,
        })
      })

      expect(toast.error).toHaveBeenCalledWith('Please connect your wallet')
    })
  })

  describe('depositToVault', () => {
    it('should handle deposits correctly', async () => {
      const mockPayload = { data: 'deposit-payload' }
      mockVaultService.depositToVault.mockResolvedValue(mockPayload)

      const { result } = renderHook(() => useVault())

      await act(async () => {
        await result.current.depositToVault(1, 100)
      })

      expect(mockVaultService.depositToVault).toHaveBeenCalledWith(1, 100)
      expect(toast.success).toHaveBeenCalledWith('Deposit successful!')
    })
  })

  describe('withdrawFromVault', () => {
    it('should handle withdrawals correctly', async () => {
      const mockPayload = { data: 'withdraw-payload' }
      mockVaultService.withdrawFromVault.mockResolvedValue(mockPayload)

      const { result } = renderHook(() => useVault())

      await act(async () => {
        await result.current.withdrawFromVault(1, 50)
      })

      expect(mockVaultService.withdrawFromVault).toHaveBeenCalledWith(1, 50)
      expect(toast.success).toHaveBeenCalledWith('Withdrawal successful!')
    })
  })

  describe('getInvestorShares', () => {
    it('should fetch investor shares', async () => {
      mockVaultService.getInvestorShares.mockResolvedValue(25)

      const { result } = renderHook(() => useVault())

      await act(async () => {
        const shares = await result.current.getInvestorShares(1, '0x123')
        expect(shares).toBe(25)
      })
    })
  })
})