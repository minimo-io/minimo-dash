// @ts-nocheck
// Initialize SQLite database
const db = new Database("src/databases/portfolio.db");
import axios from "axios";
import * as cheerio from "cheerio";
import Database from "better-sqlite3";

const sleepBetweenTickers = 200;

// Function to scrape data from the proventos page for a specific ticker
async function getProvento(ticker) {
  try {
    // Request the page with the given ticker
    const { data } = await axios.get(
      `https://www.fundamentus.com.br/fii_proventos.php?papel=${ticker}&tipo=2`,
    );

    // Load the HTML data into cheerio
    const $ = cheerio.load(data);

    // Select the rows from the table
    const rows = $("#resultado tbody tr");

    // Check if there are rows to process
    if (rows.length === 0) {
      console.log("No proventos found for ticker:", ticker);
      return null;
    }

    // Extract the last "Valor" from the last row
    const lastValor = $(rows[0]).find("td:nth-child(4)").text().trim(); // Last row's Valor

    if (lastValor) {
      // console.log(`Last Valor for ${ticker}: ${lastValor}`);
      return parseFloat(lastValor.replace(",", ".")); // Parse the dividend value
    } else {
      console.log(`No Valor found for ${ticker}`);
      return null;
    }
  } catch (error) {
    console.error(`Error scraping data for ticker ${ticker}:`, error);
  }
}

// Function to introduce delay between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create the table structure with update_date and dividendo
db.exec(`
  CREATE TABLE IF NOT EXISTS fiis_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL UNIQUE,
    segmento TEXT NOT NULL,
    cotacao REAL,
    ffo_yield REAL,
    dividend_yield REAL,
    dividend_yeld_mes REAL,
    p_vp REAL,
    market_value REAL,
    liquidity REAL,
    qtd_imoveis INTEGER,
    preco_m2 REAL,
    aluguel_m2 REAL,
    cap_rate REAL,
    vacancia_media REAL,
    dividendo REAL, -- New field for the dividend
    update_date TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Prepare the SQL insert and update statements
const insertData = db.prepare(`
  INSERT INTO fiis_data (
    ticker, segmento, cotacao, ffo_yield, dividend_yield, dividend_yield_mes, p_vp,
    market_value, liquidity, qtd_imoveis, preco_m2, aluguel_m2, cap_rate, vacancia_media, dividendo, update_date
  ) VALUES (
    @ticker, @segmento, @cotacao, @ffo_yield, @dividend_yield, @dividend_yield_mes, @p_vp,
    @market_value, @liquidity, @qtd_imoveis, @preco_m2, @aluguel_m2, @cap_rate, @vacancia_media, @dividendo, datetime('now', 'localtime')
  );
`);

const updateData = db.prepare(`
  UPDATE fiis_data
  SET
    segmento = @segmento,
    cotacao = @cotacao,
    ffo_yield = @ffo_yield,
    dividend_yield = @dividend_yield,
    dividend_yield_mes = @dividend_yield_mes,
    p_vp = @p_vp,
    market_value = @market_value,
    liquidity = @liquidity,
    qtd_imoveis = @qtd_imoveis,
    preco_m2 = @preco_m2,
    aluguel_m2 = @aluguel_m2,
    cap_rate = @cap_rate,
    vacancia_media = @vacancia_media,
    dividendo = @dividendo,
    update_date = datetime('now', 'localtime')
  WHERE ticker = @ticker;
`);

const insertFiisDataSeries = db.prepare(`
  INSERT INTO fiis_data_series (ticker, attribute, value, date_update)
  VALUES (@ticker, @attribute, @value, datetime('now', 'localtime'));
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

    for (let i = 0; i < rows.length; i++) {
      const cells = $(rows[i]).find("td");

      // Ensure all tickers are processed even with missing fields
      const ticker = $(cells[0]).text().trim() || "0";

      // Fetch the dividend for this ticker
      const dividendo = await getProvento(ticker);

      // Data separated for calcs
      let cotacao =
        parseFloat($(cells[2]).text().trim().replace(",", ".")) || 0;
      let dividend_yield =
        parseFloat(
          $(cells[4]).text().trim().replace(",", ".").replace("%", ""),
        ) || 0;
      let dividend_yield_mes = parseFloat((dividendo / cotacao) * 100).toFixed(
        2,
      );

      const data = {
        ticker: ticker,
        segmento: $(cells[1]).text().trim() || "0",
        cotacao: cotacao,
        ffo_yield:
          parseFloat(
            $(cells[3]).text().trim().replace(",", ".").replace("%", ""),
          ) || 0,
        dividend_yield: dividend_yield,
        dividend_yield_mes: dividend_yield_mes,
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
        dividendo: dividendo, // Add the dividend to the data
      };

      if (data.p_vp !== null) {
        try {
          insertFiisDataSeries.run({
            ticker: data.ticker,
            attribute: "p_vp",
            value: data.p_vp,
          });
          console.log(
            `p_vp value inserted into fiis_data_series: ${data.ticker} - p_vp: ${data.p_vp}`,
          );
        } catch (error) {
          console.error(
            `Failed to insert p_vp into fiis_data_series for ticker ${data.ticker}:`,
            error.message,
          );
        }
      }

      try {
        // First check if the ticker already exists in the database
        const existing = db
          .prepare("SELECT ticker FROM fiis_data WHERE ticker = ?")
          .get(data.ticker);
        let data_action = "(none)";
        if (existing) {
          // Update the existing record
          updateData.run(data);
          data_action = "updated";
        } else {
          // Insert new data
          insertData.run(data);
          data_action = "inserted";
        }
        console.log(
          `Data ${data_action} successfully: ${ticker} - Dividendo: ${dividendo} - DY/mes: ${dividend_yield_mes}%`,
        );
      } catch (error) {
        console.error(
          `Failed to insert or update data for ticker ${data.ticker || "unknown"}:`,
          error.message,
        );
      }

      // Delay between each ticker request (e.g., 2000ms = 2 seconds)
      await sleep(sleepBetweenTickers); // Adjust the time to respect server rate limits
    }

    console.log("Scraping completed successfully.");
  } catch (error) {
    console.error("Error scraping data:", error.message);
  }
};

// Run the scraping function
scrapeData();
