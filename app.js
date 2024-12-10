const { AzureKeyCredential, DocumentAnalysisClient } = require("@azure/ai-form-recognizer");
const fs = require("fs")
require('dotenv').config()

const key = process.env.RECOGNIZER_KEY;
const endpoint = process.env.RECOGNIZER_ENDPOINT;

const receiptURL = fs.createReadStream("./receipts/receipt.png")

async function main() {

  const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

  const poller = await client.beginAnalyzeDocument("prebuilt-receipt", receiptURL);

  const {
    documents: [result]
  } = await poller.pollUntilDone();

  if (result) {
    const { MerchantName, Items, Total } = result.fields;

    console.log("=== Receipt Information ===");
    console.log("Type:", result.docType);
    console.log("Merchant:", MerchantName && MerchantName.content);

    console.log("Items:");
    for (const item of (Items && Items.values) || []) {
      const { Description, TotalPrice } = item.properties;

      console.log("- Description:", Description && Description.content);
      console.log("  Total Price:", TotalPrice && TotalPrice.content);
    }

    console.log("Total:", Total && Total.content);
  } else {
    throw new Error("Expected at least one receipt in the result.");
  }

}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});