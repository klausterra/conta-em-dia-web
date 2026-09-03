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
  Pencil,
  ArrowRightLeft,
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
  const {
    household,
    inviteByEmail,
    cancelInvite,
    removeMember,
    leaveHousehold,
    renameHousehold,
    joinHousehold,
  } = useHousehold();
  const [inviteEmail, setInviteEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSwitchingHouse, setIsSwitchingHouse] = useState(false);
  const [switchCode, setSwitchCode] = useState('');

  const isOwner = household?.ownerUid === user?.uid;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setStatusMsg(null);
    setIsSubmitting(true);

    try {
      await inviteByEmail(inviteEmail);
      setStatusMsg({ text: `Convite enviado por e-mail com sucesso para ${inviteEmail}!`, type: 'success' });
      setInviteEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar convite.';
      setStatusMsg({ text: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await renameHousehold(newName.trim());
      setIsEditingName(false);
      setStatusMsg({ text: 'Nome da casa atualizado com sucesso!', type: 'success' });
    } catch {
      setStatusMsg({ text: 'Não foi possível renomear a casa.', type: 'error' });
    }
  }

  async function handleSwitch(e: React.FormEvent) {
    e.preventDefault();
    if (!switchCode.trim()) return;
    setIsSubmitting(true);
    try {
      await joinHousehold(switchCode.trim().toUpperCase());
      setIsSwitchingHouse(false);
      setSwitchCode('');
      setStatusMsg({ text: 'Você entrou na nova casa com sucesso!', type: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Código inválido.';
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
      `Oi! Estou te convidando para dividir as contas da nossa casa no Conta em Dia. Acesse https://conta-em-dia-web.pages.dev/?code=${household.id} e use o código: ${household.id}`,
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
        {/* Nome da casa com opção de renomear */}
        <div className="flex items-center justify-between rounded-xl border border-[#223d32] bg-[#122019] p-3.5">
          {isEditingName ? (
            <form onSubmit={handleRename} className="flex flex-1 items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={household?.name}
                required
                className="h-9 flex-1 rounded-lg border border-[#2a4d3e] bg-[#0c1612] px-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="text-xs text-zinc-400 hover:text-white px-2"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome da Casa</p>
                <p className="text-sm font-black text-white">{household?.name || 'Minha Casa'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewName(household?.name || '');
                  setIsEditingName(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#244535] bg-[#172b22] px-2.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-[#1f3a2e] hover:text-white"
              >
                <Pencil size={13} />
                <span>Renomear</span>
              </button>
            </>
          )}
        </div>

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
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-70 shadow-lg shadow-emerald-950/40"
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

        {/* Código de convite e WhatsApp */}
        <div className="rounded-xl border border-[#223d32] bg-[#122019] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Código de convite da casa
              </p>
              <p className="mt-0.5 font-mono text-base font-black tracking-widest text-emerald-400">
                {household?.id}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#244535] bg-[#172b22] px-3 py-2 text-xs font-bold text-zinc-200 transition hover:bg-[#1f3a2e] sm:flex-initial"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsapp}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 sm:flex-initial"
              >
                <Share2 size={14} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de moradores atuais */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Users size={14} />
            <span>Moradores atuais ({household?.members?.length || 0})</span>
          </h3>

          <div className="divide-y divide-[#1c3328] rounded-xl border border-[#223d32] bg-[#14231d]">
            {household?.memberProfiles && household.memberProfiles.length > 0 ? (
              household.memberProfiles.map((member) => (
                <div key={member.uid} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="size-9 rounded-full border border-emerald-600/40 object-cover"
                      />
                    ) : (
                      <div className="grid size-9 place-items-center rounded-full bg-emerald-950 text-xs font-bold text-emerald-400 border border-emerald-800/40">
                        {member.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-bold text-white">{member.displayName}</p>
                        {member.uid === user?.uid && (
                          <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/50">
                            Você
                          </span>
                        )}
                        {member.isOwner && (
                          <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-800/50">
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

        {/* Trocar de casa ou entrar com outro código */}
        <div className="border-t border-[#1f372c] pt-4">
          {isSwitchingHouse ? (
            <form onSubmit={handleSwitch} className="space-y-3 rounded-xl bg-[#0c1612] p-3.5 border border-[#223d32]">
              <p className="text-xs font-bold text-zinc-200">Entrar em outra casa com código</p>
              <input
                value={switchCode}
                onChange={(e) => setSwitchCode(e.target.value)}
                placeholder="Ex.: 7K9QXPZ"
                required
                className="h-10 w-full rounded-xl border border-[#223d32] bg-[#14231d] px-3 text-center text-xs uppercase tracking-widest text-white outline-none focus:border-emerald-500 font-mono font-bold"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsSwitchingHouse(false)}
                  className="px-3 text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSwitchingHouse(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition"
              >
                <ArrowRightLeft size={14} />
                <span>Entrar em outra casa com código</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Tem certeza de que deseja sair desta casa?')) {
                    await leaveHousehold();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition"
              >
                <LogOut size={14} />
                <span>Sair da casa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
