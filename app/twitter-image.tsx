import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cryptocurrency NZ | Swap'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#141420',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Emerald glow */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Bottom subtle glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '15%',
            width: '500px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            Cryptocurrency NZ
          </span>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Swap tokens instantly across chains
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
