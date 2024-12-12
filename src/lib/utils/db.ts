import Database from "better-sqlite3";
import type { ExchangeRatePair, FundData } from "$lib/types"; // Importing FundData type

// Define the expected shape of the row returned by the query
interface PortfolioRow {
  portfolio_data: string; // the column containing the JSON string
}

// Initialize SQLite database
const db = new Database("./src/databases/portfolio.db", {
  verbose: console.log,
});

// Function to get portfolio data for a specific user
export function getPortfolio(userId: string): { funds: FundData[] } {
  const stmt = db.prepare(
    "SELECT portfolio_data FROM portfolios WHERE user_id = ?",
  );
  const row = stmt.get(userId) as PortfolioRow | undefined; // Explicitly type the row

  return row ? { funds: JSON.parse(row.portfolio_data) } : { funds: [] };
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
