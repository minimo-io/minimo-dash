// Initialize SQLite database
const db = new Database("src/databases/portfolio.db");
import axios from "axios";
import * as cheerio from "cheerio";
import Database from "better-sqlite3";

// Create the table structure
db.exec(`
  CREATE TABLE IF NOT EXISTS fiis_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    segmento TEXT NOT NULL,
    cotacao REAL,
    ffo_yield REAL,
    dividend_yield REAL,
    p_vp REAL,
    market_value REAL,
    liquidity REAL,
    qtd_imoveis INTEGER,
    preco_m2 REAL,
    aluguel_m2 REAL,
    cap_rate REAL,
    vacancia_media REAL
  );
`);

// Prepare the SQL insert statement
const insertData = db.prepare(`
  INSERT INTO fiis_data (
    ticker, segmento, cotacao, ffo_yield, dividend_yield, p_vp,
    market_value, liquidity, qtd_imoveis, preco_m2, aluguel_m2, cap_rate, vacancia_media
  ) VALUES (
    @ticker, @segmento, @cotacao, @ffo_yield, @dividend_yield, @p_vp,
    @market_value, @liquidity, @qtd_imoveis, @preco_m2, @aluguel_m2, @cap_rate, @vacancia_media
  );
`);

// Scrape and process data
const scrapeData = async () => {
  try {
    const url = "https://www.fundamentus.com.br/fii_resultado.php";
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
      responseType: "arraybuffer",
    });

    // Decode the response to avoid charset issues
    const data = Buffer.from(response.data, "binary").toString("latin1");
    const $ = cheerio.load(data);

    const rows = $("#tabelaResultado tbody tr");

    rows.each((_, element) => {
      const cells = $(element).find("td");

      // Ensure all tickers are processed even with missing fields
      const data = {
        ticker: $(cells[0]).text().trim() || "0",
        segmento: $(cells[1]).text().trim() || "0",
        cotacao: parseFloat($(cells[2]).text().trim().replace(",", ".")) || 0,
        ffo_yield:
          parseFloat(
            $(cells[3]).text().trim().replace(",", ".").replace("%", ""),
          ) || 0,
        dividend_yield:
          parseFloat(
            $(cells[4]).text().trim().replace(",", ".").replace("%", ""),
          ) || 0,
        p_vp: parseFloat($(cells[5]).text().trim().replace(",", ".")) || null,
        market_value:
          parseFloat(
            $(cells[6]).text().trim().replace(/\./g, "").replace(",", "."),
          ) || 0,
        liquidity:
          parseFloat(
            $(cells[7]).text().trim().replace(/\./g, "").replace(",", "."),
          ) || 0,
        qtd_imoveis: parseInt($(cells[8]).text().trim(), 10) || 0,
        preco_m2:
          parseFloat(
            $(cells[9]).text().trim().replace(/\./g, "").replace(",", "."),
          ) || 0,
        aluguel_m2:
          parseFloat(
            $(cells[10]).text().trim().replace(/\./g, "").replace(",", "."),
          ) || 0,
        cap_rate:
          parseFloat(
            $(cells[11]).text().trim().replace(",", ".").replace("%", ""),
          ) || 0,
        vacancia_media:
          parseFloat(
            $(cells[12]).text().trim().replace(",", ".").replace("%", ""),
          ) || 0,
      };

      try {
        insertData.run(data);
      } catch (error) {
        console.error(
          `Failed to insert data for ticker ${data.ticker || "unknown"}:`,
          error.message,
        );
      }
    });

    console.log("Scraping completed successfully.");
  } catch (error) {
    console.error("Error scraping data:", error.message);
  }
};

// Run the scraping function
scrapeData();
