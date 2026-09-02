import { useEffect, useRef, useState } from 'react';
import { FileUp, Sparkles, AlertCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Modal } from '@/components/Modal';
import { parseScannedCode } from '@/lib/boletoParser';
import type { ScannedBillData } from '@/types';
import { money } from '@/lib/bills';

type ScanBillModalProps = {
  open: boolean;
  onClose: () => void;
  onScanned: (data: ScannedBillData) => void;
};

export function ScanBillModal({ open, onClose, onScanned }: ScanBillModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [scannedResult, setScannedResult] = useState<ScannedBillData | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'bill-qr-reader';

  // Iniciar scanner da câmera quando tab 'camera' estiver aberta
  useEffect(() => {
    if (!open || activeTab !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;
    const scanner = new Html5Qrcode(readerElementId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.UPC_A,
      ],
      verbose: false,
    });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
        },
        (decodedText) => {
          if (!isMounted) return;
          handleCodeDetected(decodedText);
        },
        () => {
          // erros contínuos de frame descartados
        },
      )
      .then(() => {})
      .catch((err) => {
        if (isMounted) {
          console.warn('Erro ao abrir câmera:', err);
          setErrorMsg('Câmera não permitida ou indisponível. Tente enviar uma foto ou digitar o código.');
          setActiveTab('upload');
        }
      });

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [open, activeTab]);

  function stopCamera() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          void scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          });
        }
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
  }

  function handleCodeDetected(raw: string) {
    stopCamera();
    const parsed = parseScannedCode(raw);
    setScannedResult(parsed);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp', false);
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleCodeDetected(decodedText);
    } catch {
      setErrorMsg('Não conseguimos ler o código nesta imagem. Verifique a nitidez ou digite a linha digitável.');
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeDetected(manualCode);
  }

  function handleConfirm() {
    if (scannedResult) {
      onScanned(scannedResult);
      onClose();
      setScannedResult(null);
      setManualCode('');
    }
  }

  function handleReset() {
    setScannedResult(null);
    setErrorMsg('');
    if (activeTab === 'camera') {
      setActiveTab('manual');
      setTimeout(() => setActiveTab('camera'), 50);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Escanear conta ou boleto"
      description="Aponte a câmera para o código de barras, QR Code PIX ou envie uma foto da fatura."
    >
      <div className="space-y-4">
        {scannedResult ? (
          <div className="space-y-4 rounded-xl border border-[#223d32] bg-[#14231d] p-5 text-[#f1f5f3]">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles size={18} />
              <p className="text-xs font-black uppercase tracking-wider">Conta detectada com sucesso</p>
            </div>

            <div className="space-y-2 border-t border-[#1f372c] pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Identificação sugerida:</span>
                <span className="font-bold text-white">{scannedResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Categoria:</span>
                <span className="font-bold text-emerald-300">{scannedResult.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor detectado:</span>
                <span className="text-lg font-black text-white">
                  {scannedResult.value ? money.format(scannedResult.value) : 'A definir'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Dia de vencimento:</span>
                <span className="font-bold text-white">
                  {scannedResult.due ? `Dia ${scannedResult.due}` : 'Hoje'}
                </span>
              </div>
              {scannedResult.barcode && (
                <div className="mt-2 rounded-lg bg-[#0b1411] p-2 text-[11px] font-mono text-zinc-400 break-all">
                  {scannedResult.barcode}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-xl border border-[#223d32] py-2.5 text-sm font-bold text-zinc-300 hover:bg-[#1a2e26]"
              >
                Escanear outro
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
              >
                Continuar cadastro
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex rounded-xl bg-[#0f1b16] p-1 text-xs font-bold text-zinc-400">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('camera');
                }}
                className={`flex-1 rounded-lg py-2 transition ${
                  activeTab === 'camera' ? 'bg-[#1b2f26] text-white shadow' : 'hover:text-zinc-200'
                }`}
              >
                Câmera ao vivo
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('upload');
                }}
                className={`flex-1 rounded-lg py-2 transition ${
                  activeTab === 'upload' ? 'bg-[#1b2f26] text-white shadow' : 'hover:text-zinc-200'
                }`}
              >
                Enviar imagem
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('manual');
                }}
                className={`flex-1 rounded-lg py-2 transition ${
                  activeTab === 'manual' ? 'bg-[#1b2f26] text-white shadow' : 'hover:text-zinc-200'
                }`}
              >
                Linha digitável
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Conteúdo de cada tab */}
            {activeTab === 'camera' && (
              <div className="relative overflow-hidden rounded-2xl border border-[#223d32] bg-black">
                <div id={readerElementId} className="w-full min-h-[260px]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center">
                  <span className="rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                    Posicione o código de barras ou QR Code no quadro
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="rounded-2xl border border-dashed border-[#2b4b3e] bg-[#122019] p-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#1b3127] text-emerald-400">
                  <FileUp size={24} />
                </div>
                <p className="mt-3 text-sm font-bold text-white">Carregar foto do boleto ou fatura</p>
                <p className="mt-1 text-xs text-zinc-400">JPG, PNG ou foto tirada na hora pelo celular</p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500">
                  <span>Selecionar arquivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div id="file-scanner-temp" className="hidden" />
              </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300">
                  Cole ou digite a linha digitável do boleto / código PIX
                  <textarea
                    rows={3}
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ex.: 846400000018 234501090114... ou código copia e cola"
                    className="mt-2 w-full rounded-xl border border-[#223d32] bg-[#122019] p-3 text-xs font-mono text-white outline-none focus:border-emerald-500"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-500"
                >
                  Processar código
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
