import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const baseUrl = url.origin
  return NextResponse.redirect(new URL('/docs/api', baseUrl), 301)
}



