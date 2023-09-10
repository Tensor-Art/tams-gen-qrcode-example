import { tamsSDK } from '@/service/tams'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const id = context.params.id
  const resp = await tamsSDK.v1.tamsApiV1ServiceGetJob(id)
  return NextResponse.json(resp.data.job || null)
}
