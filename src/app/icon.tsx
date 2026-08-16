import { ImageResponse } from 'next/og';
import { buildOrmLogoDataUri } from '@/lib/branding/orm-logo-svg';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri} width={44} height={27} alt="" />
      </div>
    ),
    { ...size },
  );
}
