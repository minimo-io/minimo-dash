import type { ExchangeRatePair } from '$lib/types';
import { CurrencyPairsVal } from '$lib/types';

export class ExchangeRateService {
	private readonly baseUrl =
		'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?formato=json';

	async fetchBrlUsdExchangeRate(): Promise<ExchangeRatePair> {
		try {
			const response = await fetch(this.baseUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const rates: ExchangeRatePair[] = await response.json();
			const latestRate = rates[rates.length - 1];

			if (!latestRate) {
				throw new Error('No exchange rate data available');
			}

			latestRate['pair'] = CurrencyPairsVal.USDBRL;

			return latestRate;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error fetching exchange rate: ${error.message}`);
			}
			throw new Error('Unknown error occurred while fetching exchange rate');
		}
	}
}
