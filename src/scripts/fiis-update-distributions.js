import axios from "axios";
import * as cheerio from "cheerio";

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
      console.log(`Last Valor for ${ticker}: ${lastValor}`);
      return lastValor;
    } else {
      console.log(`No Valor found for ${ticker}`);
      return null;
    }
  } catch (error) {
    console.error(`Error scraping data for ticker ${ticker}:`, error);
  }
}

// Example usage: Get the latest "Valor" for a ticker
const ticker = process.argv[2]; // Replace with the desired ticker
if (!ticker) {
  console.log("Please provide a ticker");
  process.exit(1);
}
getProvento(ticker);
