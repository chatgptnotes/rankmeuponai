import fs from 'fs';
import path from 'path';

export interface VersionInfo {
  version: string;
  lastUpdated: string;
  repository: string;
}

export function getVersion(): VersionInfo {
  try {
    const versionPath = path.join(process.cwd(), 'VERSION');
    const version = fs.existsSync(versionPath)
      ? fs.readFileSync(versionPath, 'utf-8').trim()
      : '1.0';

    return {
      version,
      lastUpdated: new Date().toISOString(),
      repository: 'rankmeuponai.com',
    };
  } catch (error) {
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      repository: 'rankmeuponai.com',
    };
  }
}

export function incrementVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0] || '1', 10);
  const minor = parseInt(parts[1] || '0', 10);

  return `${major}.${minor + 1}`;
}

export function updateVersionFile(newVersion: string): void {
  const versionPath = path.join(process.cwd(), 'VERSION');
  fs.writeFileSync(versionPath, newVersion, 'utf-8');
}
