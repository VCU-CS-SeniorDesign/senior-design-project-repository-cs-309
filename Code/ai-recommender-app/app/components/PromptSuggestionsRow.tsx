import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "What are the common features of a low risk score?",
        "What are the common features of a medium/moderate risk score?",
        "What are the common features of a high risk score?"
    ]
    
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt,  index) =>
                <PromptSuggestionButton
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
                />)}
        </div>
    )
}

export default PromptSuggestionsRow