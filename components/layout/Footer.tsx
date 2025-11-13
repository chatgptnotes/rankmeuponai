'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  lastUpdated: string;
  repository: string;
}

export default function Footer() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    repository: 'rankmeuponai.com',
  });

  useEffect(() => {
    // Fetch version info from API
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => setVersionInfo(data))
      .catch(() => {
        // Use default values if API fails
      });
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-center px-4">
        <p className="text-xs text-muted-foreground">
          {versionInfo.repository} | v{versionInfo.version} | Last updated:{' '}
          {formatDate(versionInfo.lastUpdated)}
        </p>
      </div>
    </footer>
  );
}
