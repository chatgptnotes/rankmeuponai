import { NextResponse } from 'next/server';
import { getVersion } from '@/lib/version/version';

export async function GET() {
  try {
    const versionInfo = getVersion();
    return NextResponse.json(versionInfo);
  } catch {
    return NextResponse.json(
      {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        repository: 'rankmeuponai.com',
      },
      { status: 200 }
    );
  }
}
