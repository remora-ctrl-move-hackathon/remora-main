import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return NextResponse.json({ 
    status: 'success',
    message: 'Fiat credited (mock)',
    fiatAmount: body.amount,
    currency: body.currency || 'USD'
  })
}