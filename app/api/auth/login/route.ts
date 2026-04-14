import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        await new Promise(r => setTimeout(r, 800)); // brute-force delay
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(SECRET);

    const res = NextResponse.json({ success: true });
    res.cookies.set('srp_token', token, {
        httpOnly: true,      // JS cannot read it
        secure: true,        // HTTPS only
        sameSite: 'strict',  // no CSRF
        maxAge: 60 * 60 * 2, // 2 hours
    });
    return res;
}