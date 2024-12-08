import { Manager, Managers } from './types/managers';
import type { ExchangePair, CurrencyPairs as ImportedCurrencyPairs } from './types/exchangeRate';
import { CurrencyPairs as CurrencyPairsVal } from './types/exchangeRate';

export interface Sector {
	state: 'cdi' | 'ipca' | 'hibrido' | 'tijolo' | 'shopping' | 'rendaurbana';
}

export interface FundData {
	ticker: string; // The ticker of the fund (e.g., 'BTLG11')
	date: string; // The date associated with the data (e.g., 'Apr 23 ,2021')
	sector: string; // The sector (e.g., 'tijolo', 'papel', etc.)
	subSector: string; // The subsector (e.g., 'logistica', 'shopping', etc.)
	pvp: number; // Value (e.g., 0.88)
	dyMo: number; // Value (e.g., 0.85)
	dyAvgHist: number; // Value (e.g., 0.725)
	alloc: number; // Quantity (e.g., 20)
	price: number; // Price (e.g., 90.09)
	shares: number; // Cotas (e.g., 1),
	manager: Manager; // Patria | Capitania \ etc
	comment?: string;
}
export type FundDataArray = FundData[];
export type ExchangeRatePair = ExchangePair;

export type CurrencyPairs = ImportedCurrencyPairs;

export { Manager, Managers, CurrencyPairsVal };
