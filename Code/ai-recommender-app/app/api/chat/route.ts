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
            // AMOUNT OF CONTEXT PROVIDED (how many chunks for it to give to the AI)
                limit: 10 // might want to use fewer for token limits (but that means less context is provided to the AI)
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)
            console.log(`docContext: ${docContext}`)

        } catch (err) {
            console.log("Error querying db...")
            docContext = ""
        }
// adjust background (need to figure out when we should have it provide a risk score)
// If applicable, or asked for, provide a risk score (low, medium, or high) for the scenario/prompt.
        const systemPrompt = `You are an AI assistant who knows everything about GRC (Governance, Risk, Compliance),
            regulations, risks, and mitigations in the financial service industry. Use the below context to augment what
            you know about the financial service industry and GRC. The context will provide you with more specific and
            recent data from a variety of sources.

            If the context doesn't include the information you need, DO NOT use outside information; you should only EVER
            use the information in the context provided.
            Format responses using markdown where applicable and don't return images.
            
            Using the information provided, create a write up with the following information and sections: 
            title, description, and type (is this a risk, control, requirement, action/test, item/plan, etc.?) you
            are creating a write-up for. Add additional sections/info necessary for the specific type. For example, a
            risk would likely need a risk score (low, medium, or high) for the scenario/prompt.
            -----------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            -----------------
            PROMPT: ${latestMessage}
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