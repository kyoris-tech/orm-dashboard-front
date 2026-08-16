import { ImageResponse } from 'next/og';
import { buildOrmLogoDataUri } from '@/lib/branding/orm-logo-svg';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const logoDataUri = buildOrmLogoDataUri('#FFFFFF');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c3355',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri} width={124} height={76} alt="" />
      </div>
    ),
    { ...size },
  );
}
