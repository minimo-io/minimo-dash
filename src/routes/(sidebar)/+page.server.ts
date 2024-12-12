import type { FundData, PortfolioRow } from "$lib/types"; // Adjust the path if needed
// import { getPortfolio } from '$lib/utils/db';
import * as db from "$lib/utils/db";
import type { PageServerLoad } from "./$types";
import { ExchangeRateService } from "$lib/services/exchangeRateService";

// Define the load function as a PageServerLoad
export const load: PageServerLoad = async () => {
  try {
    // Before getting a new rate, check if the last one is for today or not
    // If it is for today, do not get it just use the database and print the time
    // get usd/brl pair exchange rate
    const service = new ExchangeRateService();
    let usdToBrl;
    try {
      const rate = await service.fetchBrlUsdExchangeRate();
      // Save rate to the database
      await db.saveExchange(rate);
      // console.log(`Date: ${rate.data}, ${rate.pair} Rate: ${rate.valor}`);
      usdToBrl = rate.valor;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      // process.exit(1);
    }

    const portfolioID = 1; // Replace with actual user ID

    const portfolio = db.getPortfolio(portfolioID);
    let porfolioFunds: PortfolioFundData[] | null = [];
    if (portfolio != null) {
      porfolioFunds = db.getPortfolioFunds(portfolio) || null;
    }

    // const portfolio = db.getPortfolio(portfolioID);

    // Map the manager field to the Manager enum
    // const carteiraFinal: FundData[] = portfolio.funds.map((item: FundData) => ({
    //   ...item,
    //   manager: mapManager(item.manager.toString()), // Convert manager to enum
    // }));

    return {
      carteira: porfolioFunds,
      usdToBrl: usdToBrl || 0,
      series: [
        {
          name: "Revenue",
          data: [6356, 6218, 6156, 6526, 6356, 6256, 6056],
          color: "#EF562F",
        },
        {
          name: "Revenue (previous period)",
          data: [6556, 6725, 6424, 6356, 6586, 6756, 6616],
          color: "#FDBA8C",
        },
      ],
    };
  } catch (error) {
    console.error("Error loading portfolio:", error);
    return { carteira: [] }; // Return an empty portfolio on error
  }
};
