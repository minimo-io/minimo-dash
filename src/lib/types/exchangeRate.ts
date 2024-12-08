export enum CurrencyPairs {
	USDBRL = 'USD/BRL'
}
export interface ExchangePair {
	pair: CurrencyPairs;
	data: string;
	valor: string;
}
