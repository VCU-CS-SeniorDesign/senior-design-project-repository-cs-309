import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "Question 1 (add)",
        "Question 2 (add)",
        "Question 3 (add)",
        "Question 4 (add)"
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