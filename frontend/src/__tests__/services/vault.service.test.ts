import { VaultService } from '@/services/vault.service'
import { aptosClient } from '@/lib/aptos-client'

jest.mock('@/lib/aptos-client', () => ({
  aptosClient: {
    buildTransaction: jest.fn(),
    viewFunction: jest.fn(),
  },
}))

describe('VaultService', () => {
  let vaultService: VaultService

  beforeEach(() => {
    vaultService = new VaultService()
    jest.clearAllMocks()
  })

  describe('createVault', () => {
    it('should create a vault with correct parameters', async () => {
      const mockTransaction = { data: 'mock-transaction' }
      ;(aptosClient.buildTransaction as jest.Mock).mockResolvedValue(mockTransaction)

      const params = {
        name: 'Test Vault',
        description: 'Test Description',
        managementFee: 2,
        performanceFee: 20,
        minDeposit: 100,
      }

      const result = await vaultService.createVault(params)

      expect(aptosClient.buildTransaction).toHaveBeenCalledWith({
        function: expect.stringContaining('create_vault'),
        functionArguments: [
          params.name,
          params.description,
          '200', // 2% * 100
          '2000', // 20% * 100
          '10000000000', // 100 * 1e8
          expect.any(String),
        ],
      })
      expect(result).toEqual(mockTransaction)
    })
  })

  describe('depositToVault', () => {
    it('should format deposit amount correctly', async () => {
      const mockTransaction = { data: 'mock-transaction' }
      ;(aptosClient.buildTransaction as jest.Mock).mockResolvedValue(mockTransaction)

      await vaultService.depositToVault(1, 50.5)

      expect(aptosClient.buildTransaction).toHaveBeenCalledWith({
        function: expect.stringContaining('deposit_to_vault'),
        functionArguments: [
          '1',
          '5050000000', // 50.5 * 1e8
          expect.any(String),
        ],
      })
    })
  })

  describe('withdrawFromVault', () => {
    it('should convert shares to smallest unit correctly', async () => {
      const mockTransaction = { data: 'mock-transaction' }
      ;(aptosClient.buildTransaction as jest.Mock).mockResolvedValue(mockTransaction)

      await vaultService.withdrawFromVault(1, 0.5)

      expect(aptosClient.buildTransaction).toHaveBeenCalledWith({
        function: expect.stringContaining('withdraw_from_vault'),
        functionArguments: [
          '1',
          '50000000', // 0.5 * 1e8
          expect.any(String),
        ],
      })
    })
  })

  describe('getVault', () => {
    it('should parse vault data correctly', async () => {
      const mockVaultData = [
        'Test Vault',
        'Test Description',
        '0x123', // manager
        '10000000000', // total value
        '5000000000', // total shares
        '200', // management fee
        '2000', // performance fee
        '100000000', // min deposit
        '1', // status
        '1000', // creation time
        JSON.stringify({ allTime: 15.5, month: 2.5, week: 0.5 }),
      ]
      ;(aptosClient.viewFunction as jest.Mock).mockResolvedValue(mockVaultData)

      const result = await vaultService.getVault(1)

      expect(result).toEqual({
        vaultId: 1,
        name: 'Test Vault',
        description: 'Test Description',
        manager: '0x123',
        totalValue: 100,
        totalShares: 50,
        managementFee: 2,
        performanceFee: 20,
        minDeposit: 1,
        status: 1,
        createdAt: 1000,
        performance: {
          allTime: 15.5,
          month: 2.5,
          week: 0.5,
        },
      })
    })

    it('should return null for non-existent vault', async () => {
      ;(aptosClient.viewFunction as jest.Mock).mockResolvedValue(null)

      const result = await vaultService.getVault(999)

      expect(result).toBeNull()
    })
  })
})