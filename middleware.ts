import { NextRequest, NextResponse } from 'next/server'

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
}

export function middleware(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? ''
  const incomingSecret = authorization.slice(`Bearer `.length)
  if (incomingSecret !== process.env.APP_SECRET) {
    return NextResponse.json(
      { code: -1, message: 'authentication failed' },
      {
        status: 401,
      },
    )
  }
}
