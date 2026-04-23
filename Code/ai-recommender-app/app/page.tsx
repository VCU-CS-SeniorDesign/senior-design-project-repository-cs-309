"use client"
import Image from "next/image"
import AIRecommenderLogo from "./assets/AIRecommenderLogo.png"
import { useChat } from "ai/react"
import { Message } from "ai"
import { useState } from "react"

import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {
    const { append, isLoading, messages } = useChat()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [mitigation, setMitigation] = useState("")

    const noMessages = !messages || messages.length === 0

    const handlePrompt = (promptText) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (!description.trim()) {
            alert("Please enter a description.")
            return
        }
        const combined = `Title: ${title}\nDescription: ${description}\nExisting Mitigation Actions: ${mitigation}`
        const msg: Message = {
            id: crypto.randomUUID(),
            content: combined,
            role: "user"
        }
        append(msg)
        setTitle("")
        setDescription("")
        setMitigation("")
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
                            using documents about various regulations for reference.
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
            <form onSubmit={handleFormSubmit}>
                <div className="form-fields">
                    <div className="form-group full-width">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            className="field-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title..."
                        />
                    </div>                    
                    <div className="form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            className="field-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the scenario..."
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="mitigation">Existing Mitigation Actions</label>
                        <textarea
                            id="mitigation"
                            className="field-textarea"
                            value={mitigation}
                            onChange={(e) => setMitigation(e.target.value)}
                            placeholder="Describe any mitigation actions already in place..."
                        />
                    </div>
                </div>
                <input type="submit" value="Analyze"/>
            </form>
        </main>
    )
}

export default Home
