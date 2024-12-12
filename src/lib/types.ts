import { Manager, Managers } from "./types/managers";
import type {
  ExchangePair,
  CurrencyPairs as ImportedCurrencyPairs,
} from "./types/exchangeRate";
import { CurrencyPairs as CurrencyPairsVal } from "./types/exchangeRate";

export interface Sector {
  state: "cdi" | "ipca" | "hibrido" | "tijolo" | "shopping" | "rendaurbana";
}

export interface FundData {
  ticker: string; // The ticker of the fund (e.g., 'BTLG11')
  segmento: string;
  gestora?: Manager; // Patria | Capitania \ etc
  cotacao: number;
  ffo_yield: number;
  dividend_yield: number;
  dividend_yield_mes: number;
  dividend_yield_historico: number;
  p_vp: number;
  market_value: number;
  liquidity: number;
  qtd_imoveis: number;
  preco_m2: number;
  aluguel_m2: number;
  cap_rate: number;
  vacancia_media: number;
  dividendo: number;
  update_date: string; // The date associated with the data (e.g., 'Apr 23 ,2021')
  comentarios?: string;
}

// Define the expected shape of the row returned by the query
export interface PortfolioRow {
  id: number;
  portfolio_id: number;
  user_id: number;
  ticker: string;
  shares: number;
  alloc: number;
}
// New type to combine PortfolioRow with FundData
export interface PortfolioFundData extends FundData {
  portfolio: PortfolioRow; // Add the entire PortfolioRow object
}

export type FundDataArray = FundData[];
export type ExchangeRatePair = ExchangePair;

export type CurrencyPairs = ImportedCurrencyPairs;

export { Manager, Managers, CurrencyPairsVal };
