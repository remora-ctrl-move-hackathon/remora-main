const API_BASE = '/api'

export const api = {
  remit: {
    send: async (data: any) => {
      const res = await fetch(`${API_BASE}/remit/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    }
  },
  
  offramp: {
    simulate: async (data: any) => {
      const res = await fetch(`${API_BASE}/offramp/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    }
  },
  
  billpay: {
    pay: async (data: any) => {
      const res = await fetch(`${API_BASE}/billpay/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    }
  },
  
  indexer: {
    getStreams: async (address: string) => {
      const res = await fetch(`${API_BASE}/indexer/streams?address=${address}`)
      return res.json()
    },
    getVaults: async (id?: string) => {
      const url = id ? `${API_BASE}/indexer/vaults?id=${id}` : `${API_BASE}/indexer/vaults`
      const res = await fetch(url)
      return res.json()
    }
  }
}