import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

// {
// 		"ticker": "BTLG11",
// 		"date": "Apr 23, 2021",
// 		"sector": "tijolo",
// 		"subSector": "logistica",
// 		"pvp": 0.88,
// 		"dyMo": 0.85,
// 		"dyAvgHist": 0.725,
// 		"alloc": 20,
// 		"price": 90.09,
// 		"shares": 1,
// 		"manager": "BTG"
// 	},
//

let porfolioID = "1";
const ticker = process.argv[2]; // Replace with the desired ticker
if (!ticker) {
  console.log("Please provide a ticker");
  process.exit(1);
}

// 1. Open the database and get the whole json list of fiis

// 2. Loop through all of them

// 3. Scrap and update all values from the json above
// 4. and update the json

// Update the database entry

const scrapeData = async () => {
  try {
    const url = `https://www.fundamentus.com.br/detalhes.php?papel=${ticker}`;
    console.log(url);
    // Fetch the raw response as a buffer
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
      responseType: "arraybuffer", // Retrieve raw binary data
    });

    // Decode the response from ISO-8859-1 to UTF-8
    const decodedHtml = iconv.decode(data, "ISO-8859-1");

    // Load the decoded HTML with Cheerio
    const $ = cheerio.load(decodedHtml);

    // Extract "Cotação"
    const cotacao = $('td.label.destaque:contains("Cotação")')
      .next("td.data.destaque")
      .find("span.txt")
      .text()
      .trim();

    // Extract "P/VP"
    const pVp = $('td.label:contains("P/VP")')
      .next("td.data")
      .find("span.txt")
      .text()
      .trim();

    // Log the results
    console.log(`Ticker: ${ticker}`);
    console.log(`Cotação: ${cotacao}`);
    console.log(`P/VP: ${pVp}`);
  } catch (error) {
    console.error("Error scraping data:", error.message);
  }
};

scrapeData();
