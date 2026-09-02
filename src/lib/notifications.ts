import type { Bill } from '@/types';
import { money } from '@/lib/bills';

const NOTIFIED_KEY = 'conta_em_dia_last_notification_date';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  return await Notification.requestPermission();
}

/**
 * Envia uma notificação local via Service Worker ou Notification API direta.
 */
export async function sendNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const defaultOptions: NotificationOptions = {
    icon: '/pwa-192x192.png',
    badge: '/favicon.svg',
    ...options,
  };

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return;
      }
    } catch {
      // fallback abaixo
    }
  }

  try {
    new Notification(title, defaultOptions);
  } catch (err) {
    console.warn('Falha ao instanciar Notification direta:', err);
  }
}

/**
 * Verifica as contas do usuário e dispara notificações se houver vencimentos hoje ou amanhã.
 */
export async function checkAndNotifyDueBills(bills: Bill[]): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const today = new Date();
  const todayDay = today.getDate();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${todayDay}`;

  const lastNotified = localStorage.getItem(NOTIFIED_KEY);
  if (lastNotified === dateKey) {
    // Já notificou hoje
    return;
  }

  const unpaid = bills.filter((b) => !b.paid);
  const dueToday = unpaid.filter((b) => b.due === todayDay);
  const dueTomorrow = unpaid.filter((b) => b.due === todayDay + 1);

  if (dueToday.length > 0) {
    const totalVal = dueToday.reduce((sum, b) => sum + b.value, 0);
    const names = dueToday.map((b) => b.name).join(', ');
    await sendNotification(`⚠️ Conta vencendo hoje! (${names})`, {
      body: `Você tem ${dueToday.length} conta(s) vencendo hoje, totalizando ${money.format(totalVal)}. Evite juros!`,
      tag: 'conta-vencendo-hoje',
    });
    localStorage.setItem(NOTIFIED_KEY, dateKey);
  } else if (dueTomorrow.length > 0) {
    const totalVal = dueTomorrow.reduce((sum, b) => sum + b.value, 0);
    const names = dueTomorrow.map((b) => b.name).join(', ');
    await sendNotification(`🔔 Conta vence amanhã (${names})`, {
      body: `Fique atento: ${names} vence amanhã no valor de ${money.format(totalVal)}.`,
      tag: 'conta-vence-amanha',
    });
    localStorage.setItem(NOTIFIED_KEY, dateKey);
  }
}
