"use client"
import Image from "next/image"
import AIRecommenderLogo from "./assets/AIRecommenderLogo.png"
import { useChat } from "ai/react"
import { Message } from "ai"

import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {
    const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat()

    const noMessages = !messages || messages.length === 0

    const handlePrompt = ( promptText ) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)
    }

    return (
        <main>
            <Image src={AIRecommenderLogo} width="650" alt="AI Recommender Logo"/>
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            Write about a scenario you want a write-up for. If possible,
                            provide a specific title, type, and other info.
                            Make sure to provide a description in the prompt.
                            The Chatbot will make a write-up for the given information,
                            using documents about various regulations for refernece.
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                       {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                       {isLoading && <LoadingBubble/>}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input className="question-box" onChange={handleInputChange} value={input} placeholder="Provide a description..."/>
                <input type="submit"/>
            </form>
        </main>
    )
}

export default Home