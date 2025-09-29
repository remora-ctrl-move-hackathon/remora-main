import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return NextResponse.json({ 
    status: 'success',
    message: 'Bill paid (mock)',
    provider: body.provider,
    amount: body.amount
  })
}