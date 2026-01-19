// followed this tutorial: https://www.youtube.com/watch?v=d-VKYF4Zow0
import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer" // help with scraping
// used to create vector embeddings and make responses more human readable
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config" // used to hide secret variables (e.g., tokens, API keys)

import path from 'path';


type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    GOOGLE_GENERATIVE_AI_API_KEY
} = process.env

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    model: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_DOCUMENT
})

// sites to scrape for data
const chatbotTrainingData = [
    // comment out documents already added to website (for now), otherwise duplicates will be added when run again
    //`file://${path.resolve('../documents/matrix.html')}`
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
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                // has to match Google dimensions (look at documentation; we are using text-embedding-004)
                dimension: 768,
                metric: similarityMetric
            }
        })
        console.log(res)
    } catch (e) {
        console.log("Collection already exists, skipping creation...")
    }
}

// split data and get chunks, run them through model to get vectors
const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of chatbotTrainingData ) {
        console.log(`Scraping: ${url}`)
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)

        for await ( const chunk of chunks ) {
            // generate embedding using Google AI
            const vector = await embeddingsModel.embedQuery(chunk)

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

createCollection().then(() => loadSampleData())