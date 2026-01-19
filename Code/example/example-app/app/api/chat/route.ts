import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { DataAPIClient } from "@datastax/astra-db-ts"


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
    taskType: TaskType.RETRIEVAL_QUERY
})

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })


export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const latestMessage = messages[messages?.length - 1].content

        let docContext = ""

        const vector = await embeddingsModel.embedQuery(latestMessage)

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: vector,
                },
// LESS CONTEXT PROVIDED
                limit: 2 // down from 10 due to token limits (i.e., less context provided to AI)
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)

        } catch (err) {
            console.log("Error querying db...")
            docContext = ""
        }

        const systemPrompt = `You are an AI assistant who knows everything about Formula One.
            Use the below context to augment what you know about Formula One racing.
            The context will provide you with the most recent page data from wikipedia,
            the official F1 website, and others.
            If the context doesn't include the information you need, answer based on
            your existing knowledge and don't mention the source of your information or
            what the context does or doesn't include.
            Format responses using markdown where applicable and don't return images.
            -----------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            -----------------
            QUESTION: ${latestMessage}
            -----------------
            `

        const response = await streamText({
            model: google('gemini-2.5-flash-lite') as any,
            system: systemPrompt,
            messages: messages
        })

        return (response as any).toAIStreamResponse()
    } catch (err) {
        throw err
    }
}