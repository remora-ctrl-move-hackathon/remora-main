import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const vaultId = searchParams.get('id')
  
  return NextResponse.json({ 
    vaults: [],
    count: 0
  })
}