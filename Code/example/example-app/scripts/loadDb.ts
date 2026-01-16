// followed this tutorial: https://www.youtube.com/watch?v=d-VKYF4Zow0
import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer" // help with scraping
import OpenAI from "openai" // used to create vector embeddings and make responses more human readable

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config" // used to hide secret variables (e.g., tokens, API keys)


type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// sites to scrape for data
const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.forumla1.com/en/latest/all',
    'https://www.formula1.com/en/racing/2024.html'
]

// strict in tsconfig.json set to false so warnings aren't given
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

// how we split up scraped data
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512, // number of characters in each chunk
    chunkOverlap: 100 // number of overlapping characters between chunks (preserves cross-chunk context)
})

// create a collection in Astra database
const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            // has to match OpenAI dimensions (look at documentation; we are using text-embedding-3-small)
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}

// split data and get chunks, run them through model to get vectors
const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of f1Data ) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await ( const chunk of chunks ) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })

            const vector = embedding.data[0].embedding

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}


const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true // means no GUI
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '') // strip out HTML tags from page content (it's not needed)
}


// *******only use if no collection already exists; might want to adjust to work if collection already exists
//createCollection().then(() => loadSampleData())
loadSampleData()