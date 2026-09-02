import { useEffect, useState } from 'react';
import type { Bill } from '@/types';
import {
  checkAndNotifyDueBills,
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  sendNotification,
} from '@/lib/notifications';

export function useNotifications(bills?: Bill[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (bills && bills.length > 0 && permission === 'granted') {
      void checkAndNotifyDueBills(bills);
    }
  }, [bills, permission]);

  async function enableNotifications(): Promise<boolean> {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      await sendNotification('🎉 Notificações ativadas no Conta em Dia!', {
        body: 'Vamos te avisar sempre que uma conta estiver perto de vencer para evitar juros.',
      });
      return true;
    }
    return false;
  }

  async function sendTestNotification(): Promise<void> {
    if (permission !== 'granted') {
      const ok = await enableNotifications();
      if (!ok) return;
    }
    await sendNotification('🔔 Lembrete de teste — Conta em Dia', {
      body: 'Sua notificação está funcionando perfeitamente!',
    });
  }

  return {
    permission,
    isSupported,
    isGranted: permission === 'granted',
    enableNotifications,
    sendTestNotification,
  };
}
