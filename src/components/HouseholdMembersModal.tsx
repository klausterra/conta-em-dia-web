import { useState } from 'react';
import {
  Check,
  Copy,
  Mail,
  Share2,
  Trash2,
  UserPlus,
  Users,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useHousehold } from '@/hooks/useHousehold';
import { useAuth } from '@/hooks/useAuth';

type HouseholdMembersModalProps = {
  open: boolean;
  onClose: () => void;
};

export function HouseholdMembersModal({ open, onClose }: HouseholdMembersModalProps) {
  const { user } = useAuth();
  const { household, inviteByEmail, cancelInvite, removeMember, leaveHousehold } = useHousehold();
  const [inviteEmail, setInviteEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = household?.ownerUid === user?.uid;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setStatusMsg(null);
    setIsSubmitting(true);

    try {
      await inviteByEmail(inviteEmail);
      setStatusMsg({ text: `Convite registrado para ${inviteEmail}!`, type: 'success' });
      setInviteEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar convite.';
      setStatusMsg({ text: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyCode() {
    if (!household) return;
    await navigator.clipboard.writeText(household.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareWhatsapp() {
    if (!household) return;
    const text = encodeURIComponent(
      `Oi! Estou te convidando para dividir as contas da nossa casa no Conta em Dia. Acesse https://conta-em-dia-web.pages.dev e use o código: ${household.id}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Moradores da casa"
      description={`Gerencie quem tem acesso às contas de ${household?.name || 'sua casa'}.`}
    >
      <div className="space-y-6">
        {/* Formulário de convite por e-mail */}
        <form onSubmit={handleInvite} className="space-y-3">
          <label className="block text-xs font-bold text-zinc-300">
            Convidar por e-mail
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3 top-3 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="h-11 w-full rounded-xl border border-[#223d32] bg-[#122019] pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-70"
              >
                <UserPlus size={15} />
                <span>{isSubmitting ? 'Enviando…' : 'Convidar'}</span>
              </button>
            </div>
          </label>

          {statusMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                statusMsg.type === 'success'
                  ? 'border border-emerald-900/60 bg-emerald-950/40 text-emerald-300'
                  : 'border border-rose-900/60 bg-rose-950/40 text-rose-300'
              }`}
            >
              <AlertCircle size={14} />
              <span>{statusMsg.text}</span>
            </div>
          )}
        </form>

        {/* Compartilhamento rápido por link e WhatsApp */}
        <div className="rounded-xl border border-[#223d32] bg-[#14231d] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-200">Código de convite da casa</p>
              <p className="mt-1 font-mono text-sm font-black tracking-wider text-emerald-400">
                {household?.id}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className="flex items-center gap-1.5 rounded-lg border border-[#223d32] bg-[#192b23] px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-[#20362c]"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsapp}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700/70 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de moradores atuais */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Users size={14} className="text-emerald-400" />
              Moradores atuais ({household?.members.length ?? 0})
            </h3>
          </div>

          <div className="divide-y divide-[#1c3328] rounded-xl border border-[#223d32] bg-[#14231d]">
            {household?.memberProfiles && household.memberProfiles.length > 0 ? (
              household.memberProfiles.map((member) => (
                <div key={member.uid} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="size-9 rounded-full object-cover border border-[#223d32]"
                      />
                    ) : (
                      <div className="grid size-9 place-items-center rounded-full bg-[#1e382c] font-black text-xs text-emerald-300">
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-bold text-white">{member.displayName}</p>
                        {member.uid === user?.uid && (
                          <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/60">
                            Você
                          </span>
                        )}
                        {member.isOwner && (
                          <span className="rounded-full bg-amber-950 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-800/60">
                            Admin
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <p className="truncate text-[11px] text-zinc-400">{member.email}</p>
                      )}
                    </div>
                  </div>

                  {isOwner && member.uid !== user?.uid && (
                    <button
                      type="button"
                      onClick={() => void removeMember(member.uid)}
                      aria-label={`Remover ${member.displayName}`}
                      className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-rose-950/60 hover:text-rose-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-xs text-zinc-500">Nenhum membro carregado.</p>
            )}
          </div>
        </div>

        {/* Convites pendentes */}
        {household?.invites && household.invites.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Convites pendentes ({household.invites.length})
            </h3>
            <div className="divide-y divide-[#1c3328] rounded-xl border border-[#223d32] bg-[#14231d]">
              {household.invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 text-xs">
                  <div>
                    <p className="font-bold text-zinc-200">{invite.email}</p>
                    <p className="text-[10px] text-zinc-500">
                      Convidado por {invite.invitedBy}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void cancelInvite(invite.id)}
                    className="rounded-lg border border-[#223d32] px-2.5 py-1 text-[11px] text-zinc-400 hover:text-rose-400"
                  >
                    Cancelar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sair da casa */}
        <div className="border-t border-[#1f372c] pt-4">
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Tem certeza de que deseja sair desta casa?')) {
                await leaveHousehold();
                onClose();
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut size={14} />
            <span>Sair desta casa</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
