/**
 * OWNER: P1 (Frontend)
 * CTA to start a live session. Caller is responsible for navigation.
 */
import { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  lectureId: string;
  onStarted?: () => void;
}

export function StartSessionButton({ lectureId, onStarted }: Props) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      await api.startSession(lectureId);
      toast.success('Canlı oturum başladı.');
      onStarted?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button size="lg" onClick={go} disabled={busy}>
      <Mic className="h-4 w-4" />
      Canlı oturumu başlat
    </Button>
  );
}
