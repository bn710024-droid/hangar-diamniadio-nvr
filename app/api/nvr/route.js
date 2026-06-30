// app/api/nvr/route.js — Proxy Digest Auth vers NVR Hikvision
import { NextResponse } from 'next/server'

const NVR_HOST = process.env.NVR_PUBLIC_IP  || '192.168.0.199'
const NVR_PORT = process.env.NVR_PUBLIC_PORT || '3000'
const NVR_USER = process.env.NVR_USER        || 'admin'
const NVR_PASS = process.env.NVR_PASS        || 'Mbao@2024'

// Détermine le protocole selon le port
function buildUrl(host, port, path) {
  const p = String(port)
  if (p === '443' || host.includes('.trycloudflare.com') || host.includes('.cloudflare')) {
    return `https://${host}${path}`
  }
  return `http://${host}:${p}${path}`
}

function md5(str) {
  const { createHash } = require('crypto')
  return createHash('md5').update(str).digest('hex')
}

function parseDigest(header) {
  const params = {}
  const re = /(\w+)=(?:"([^"]+)"|(\S+))/g
  let m
  while ((m = re.exec(header)) !== null) params[m[1]] = m[2] !== undefined ? m[2] : m[3]
  return params
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path    = searchParams.get('path') || '/ISAPI/System/status'
  const nvrUrl  = buildUrl(NVR_HOST, NVR_PORT, path)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  try {
    // Étape 1 : obtenir le défi Digest
    const res1 = await fetch(nvrUrl, { signal: AbortSignal.timeout(10000) })

    // Certains proxys (cloudflared, proxy local) passent déjà l'auth
    if (res1.status === 200) {
      const body = await res1.text()
      return new Response(body, { status: 200, headers: { ...headers, 'Content-Type': 'text/xml' } })
    }

    if (res1.status !== 401) {
      return NextResponse.json({ ok: false, status: res1.status, url: nvrUrl }, { status: res1.status, headers })
    }

    const wwwAuth = res1.headers.get('WWW-Authenticate') || ''
    if (!wwwAuth.toLowerCase().startsWith('digest ')) {
      return NextResponse.json({ ok: false, error: 'auth-scheme-unknown' }, { status: 401, headers })
    }

    const ch = parseDigest(wwwAuth)
    if (!ch.nonce) return NextResponse.json({ ok: false, error: 'no-nonce' }, { status: 401, headers })

    const ha1      = md5(`${NVR_USER}:${ch.realm}:${NVR_PASS}`)
    const ha2      = md5(`GET:${path}`)
    const nc       = '00000001'
    const cnonce   = Math.random().toString(36).substring(2, 10)
    const qop      = (ch.qop || '').includes('auth') ? 'auth' : null
    const response = qop
      ? md5(`${ha1}:${ch.nonce}:${nc}:${cnonce}:auth:${ha2}`)
      : md5(`${ha1}:${ch.nonce}:${ha2}`)

    const authHdr = [
      `Digest username="${NVR_USER}"`,
      `realm="${ch.realm}"`,
      `nonce="${ch.nonce}"`,
      `uri="${path}"`,
      qop ? `qop=auth`      : null,
      qop ? `nc=${nc}`       : null,
      qop ? `cnonce="${cnonce}"` : null,
      `response="${response}"`,
      ch.opaque ? `opaque="${ch.opaque}"` : null,
    ].filter(Boolean).join(', ')

    // Étape 2 : requête authentifiée
    const res2 = await fetch(nvrUrl, {
      headers: { Authorization: authHdr },
      signal: AbortSignal.timeout(10000),
    })

    if (res2.status === 200) {
      const body = await res2.text()
      return new Response(body, { status: 200, headers: { ...headers, 'Content-Type': 'text/xml' } })
    }

    return NextResponse.json({ ok: false, status: res2.status }, { status: res2.status, headers })

  } catch (err) {
    const msg       = err.message || String(err)
    const isTimeout = msg.includes('timeout') || msg.includes('abort') || err.name === 'TimeoutError'
    return NextResponse.json(
      { ok: false, error: isTimeout ? 'timeout' : msg, url: nvrUrl },
      { status: 502, headers }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  })
}
