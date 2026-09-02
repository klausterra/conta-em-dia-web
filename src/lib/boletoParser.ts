import type { BillCategory, ScannedBillData } from '@/types';

/**
 * Normaliza qualquer sequência de caracteres deixando apenas dígitos.
 */
export function cleanDigits(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Converte fator de vencimento Febraban em data.
 * Base inicial: 07/10/1997 = fator 1000.
 */
export function dueDateFromFactor(factor: number): Date | null {
  if (factor <= 0) return null;
  const baseDate = new Date(1997, 9, 7); // 07/10/1997
  const currentYear = new Date().getFullYear();
  let daysToAdd = factor;
  if (currentYear >= 2025 && factor < 3000) {
    daysToAdd = factor + 9000;
  }
  const result = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return result;
}

/**
 * Tenta extrair dados estruturados de um código de boleto bancário (44 dígitos barra ou 47 dígitos linha).
 */
export function parseBoletoBancario(digits: string): ScannedBillData | null {
  if (digits.length === 47) {
    // Linha digitável: AAABC.CCCCX DDDDD.DDDDDY EEEEE.EEEEEZ K UUUUVVVVVVVVVV
    const factorStr = digits.substring(33, 37);
    const valueStr = digits.substring(37, 47);

    const factor = parseInt(factorStr, 10);
    const value = parseInt(valueStr, 10) / 100;
    const dueDate = dueDateFromFactor(factor);
    const dueDay = dueDate ? dueDate.getDate() : undefined;

    return {
      name: 'Boleto Bancário',
      category: 'Outros',
      value: value > 0 ? value : undefined,
      due: dueDay,
      barcode: digits,
    };
  }

  if (digits.length === 44 && !digits.startsWith('8')) {
    // Código de barras 44 dígitos
    const factorStr = digits.substring(5, 9);
    const valueStr = digits.substring(9, 19);

    const factor = parseInt(factorStr, 10);
    const value = parseInt(valueStr, 10) / 100;
    const dueDate = dueDateFromFactor(factor);
    const dueDay = dueDate ? dueDate.getDate() : undefined;

    return {
      name: 'Boleto Bancário',
      category: 'Outros',
      value: value > 0 ? value : undefined,
      due: dueDay,
      barcode: digits,
    };
  }

  return null;
}

/**
 * Tenta extrair dados de contas de concessionárias / serviços públicos (começa com 8).
 * Segmento (2º dígito):
 * 1 - Prefeitura
 * 2 - Saneamento (Água)
 * 3 - Energia Elétrica e Gás
 * 4 - Telecomunicações (Internet / Telefone)
 */
export function parseBoletoConcessionaria(digits: string): ScannedBillData | null {
  if (!digits.startsWith('8')) return null;

  if (digits.length === 48 || digits.length === 44) {
    const segment = digits.charAt(1);
    let category: BillCategory = 'Outros';
    let defaultName = 'Conta de Concessionária';

    if (segment === '2') {
      category = 'Agua';
      defaultName = 'Conta de Água';
    } else if (segment === '3') {
      category = 'Energia';
      defaultName = 'Conta de Energia';
    } else if (segment === '4') {
      category = 'Internet';
      defaultName = 'Conta de Internet/Telefone';
    }

    let value: number | undefined;
    if (digits.length === 48) {
      const valSlice = digits.substring(4, 11) + digits.substring(12, 15);
      const rawVal = parseInt(valSlice, 10);
      if (!isNaN(rawVal) && rawVal > 0) {
        value = rawVal / 100;
      }
    } else if (digits.length === 44) {
      const valSlice = digits.substring(4, 14);
      const rawVal = parseInt(valSlice, 10);
      if (!isNaN(rawVal) && rawVal > 0) {
        value = rawVal / 100;
      }
    }

    return {
      name: defaultName,
      category,
      value,
      due: new Date().getDate(),
      barcode: digits,
    };
  }

  return null;
}

/**
 * Parser de código PIX Copia e Cola / EMV.
 */
export function parsePixQr(raw: string): ScannedBillData | null {
  if (!raw.startsWith('000201')) return null;

  let value: number | undefined;
  let name = 'Pagamento PIX';

  const matchValue = raw.match(/54(\d{2})(\d+(\.\d+)?)/);
  if (matchValue && matchValue[2]) {
    const val = parseFloat(matchValue[2]);
    if (!isNaN(val) && val > 0) {
      value = val;
    }
  }

  const matchName = raw.match(/59(\d{2})([A-Za-z0-9\s]+)/);
  if (matchName && matchName[2]) {
    const len = parseInt(matchName[1], 10);
    name = matchName[2].substring(0, len).trim();
  }

  return {
    name,
    category: 'Outros',
    value,
    due: new Date().getDate(),
    barcode: raw.length > 50 ? `${raw.substring(0, 47)}…` : raw,
  };
}

/**
 * Função principal que processa qualquer string capturada por scanner, OCR ou colada pelo usuário.
 */
export function parseScannedCode(input: string): ScannedBillData {
  const trimmed = input.trim();

  // 1. Tenta formato PIX
  const pixData = parsePixQr(trimmed);
  if (pixData) return pixData;

  // 2. Tenta extrair dígitos de boletos
  const digits = cleanDigits(trimmed);

  if (digits.startsWith('8')) {
    const conc = parseBoletoConcessionaria(digits);
    if (conc) return conc;
  }

  const bancario = parseBoletoBancario(digits);
  if (bancario) return bancario;

  // Fallback se for apenas um código ou texto desconhecido
  return {
    name: 'Conta Escaneada',
    category: 'Outros',
    value: undefined,
    due: new Date().getDate(),
    barcode: trimmed,
  };
}
