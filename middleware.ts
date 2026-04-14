import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET_KEY!);
const PUBLIC = ['/login', '/api/auth/login'];

export async function middleware(req: NextRequest) {
    if (PUBLIC.some(p => req.nextUrl.pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const token = req.cookies.get('srp_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));

    try {
        await jwtVerify(token, SECRET);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
};