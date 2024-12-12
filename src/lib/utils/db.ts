import Database from "better-sqlite3";
import type {
  ExchangeRatePair,
  FundData,
  PortfolioRow,
  PortfolioFundData,
} from "$lib/types"; // Importing FundData type
import { Manager } from "$lib/types"; // Adjust the path if needed

// Initialize SQLite database
const db = new Database("./src/databases/portfolio.db", {
  // verbose: console.log,
});

// Function to get portfolio data for a specific user
// export function getPortfolio(portfolioID: string): { funds: PortfolioRow[] } {
//   const stmt = db.prepare(
//     "SELECT id, portfolio_id, user_id, ticker, shares, alloc FROM portfolios_b3 WHERE portfolio_id = ?",
//   );
//   const row = stmt.get(portfolioID) as PortfolioRow | undefined; // Explicitly type the row

//   return row ? { funds: JSON.parse(row) } : { funds: [] };
// }

export function getPortfolio(portfolioID: number): PortfolioRow[] | null {
  try {
    // Prepare and run the query to fetch data for the given portfolio_id
    const query = db.prepare(`
        SELECT  id, portfolio_id, user_id, ticker, shares, alloc FROM portfolios_b3 WHERE portfolio_id = ?;
      `);

    const portfolioData: PortfolioRow[] = query.all(
      portfolioID,
    ) as PortfolioRow[]; // `all` returns an array of rows

    // Return the portfolio data
    return portfolioData;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return null;
  }
}
// Function to map JSON manager string to Manager enum
const mapManager = (managerStr: string): Manager => {
  if (managerStr in Manager) {
    return Manager[managerStr as keyof typeof Manager];
  }
  throw new Error(`Invalid manager value: ${managerStr}`);
};

export function getPortfolioFunds(
  portfolio: PortfolioRow[],
): PortfolioFundData[] | null {
  try {
    // Prepare the query to get the data for each ticker from the fiis_data table
    const query = db.prepare(`
      SELECT ticker, segmento, gestora, cotacao, ffo_yield, dividend_yield,
        dividend_yield_mes, dividend_yield_historico, p_vp, market_value, liquidity,
        qtd_imoveis, preco_m2, aluguel_m2, cap_rate, vacancia_media, dividendo, update_date, comentarios
      FROM fiis_data
      WHERE ticker = ?;
    `);

    // Initialize an empty array to hold the FundData
    const portfolioFunds: PortfolioFundData[] = [];

    // Iterate over the portfolio to get data for each ticker
    portfolio.forEach((row) => {
      // Execute the query for the current ticker
      const fundDataRow = query.get(row.ticker) as FundData;

      if (fundDataRow) {
        // Map the database result to FundData
        // Map the gestora field to the Manager enum, if it exists
        if (fundDataRow.gestora) {
          try {
            fundDataRow.gestora = mapManager(fundDataRow.gestora);
          } catch (error) {
            console.error(
              `Failed to map manager for ticker ${row.ticker}: ${error.message}`,
            );
            // Optionally handle this case, e.g., set manager to null or skip the record
          }
        }

        // Combine PortfolioRow and FundData into a PortfolioFundData object
        const portfolioFundData: PortfolioFundData = {
          ...fundDataRow, // Spread the properties of FundData
          portfolio: row, // Add the PortfolioRow data
        };

        // Push the FundData object to the portfolioFunds array
        portfolioFunds.push(portfolioFundData);
      } else {
        console.log(`No data found for ticker ${row.ticker}`);
      }
    });

    // Return the list of FundData objects
    return portfolioFunds.length > 0 ? portfolioFunds : null;
  } catch (error) {
    console.error("Error fetching portfolio funds:", error);
    return null;
  }
}

export async function saveExchange(
  exchangeRate: ExchangeRatePair,
): Promise<void> {
  console.log(exchangeRate);
  const stmt = db.prepare(
    `UPDATE currencies SET value = ?, date_time = ? WHERE pair = ?`,
  );
  stmt.run(exchangeRate.valor, exchangeRate.data, exchangeRate.pair);
}

// // Function to save portfolio data for a specific user
// export function savePortfolio(userId: string, portfolio: { funds: FundData[] }): void {
// 	const stmt = db.prepare(`
//         INSERT INTO portfolios (user_id, portfolio_data)
//         VALUES (?, ?)
//         ON CONFLICT(user_id) DO UPDATE SET portfolio_data = excluded.portfolio_data
//     `);
// 	stmt.run(userId, JSON.stringify(portfolio));
// }
