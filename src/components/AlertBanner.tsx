import { useEffect, useState } from 'react';
import type { Incident } from '../api/types';
import { formatTimestamp } from '../domain/formatting';

interface AlertBannerProps {
  status: string;
  statusColor: string;
  topIncident: Incident | null;
}

export default function AlertBanner({ status, statusColor, topIncident }: AlertBannerProps) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (status !== 'NOMINAL') {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(id);
    }
  }, [status]);

  if (status === 'NOMINAL' || !topIncident) {
    return null;
  }

  return (
    <div className={'alert-banner' + (flash ? ' alert-flash' : '')} style={{ borderColor: statusColor }}>
      <strong style={{ color: statusColor }}>{status === 'CRITICAL' ? 'CRITICAL ALERT' : 'ATTENTION'}</strong>
      <span style={{ marginLeft: 10 }}>
        {topIncident.id}: {topIncident.title}
      </span>
      <span style={{ marginLeft: 'auto', color: '#8892a6', fontSize: 12 }}>{formatTimestamp(topIncident.timestamp)}</span>
    </div>
  );
}
