import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        `Sample Input: Fintech Expansion Project
        1. Service Description
        "The service is a new Cross-Border Peer-to-Peer (P2P) Lending Platform integrated into our existing digital banking app. It allows retail users in the US to lend USD to small business borrowers in Southeast Asia. The platform uses a proprietary AI credit-scoring model and settles transactions via a third-party stablecoin gateway to reduce remittance fees."
        2. Operational & Technical Details
        Data Sovereignty: Customer PII (Personally Identifiable Information) is stored on a US-based cloud provider, but transaction metadata is mirrored in regional nodes in Singapore for latency optimization.
        Third-Party Reliance: Settlement relies 100% on 'GlobalPay Crypto-Bridge,' a Series B startup that recently underwent a SOC2 Type I audit but has no historical uptime data.
        Access Control: Access to the AI model's backend is managed via MFA, but the underlying training data sets are accessible to the entire data science team (30+ individuals).
        3. Compliance & Legal Context
        Regulatory Exposure: The service must comply with AML/KYC (Anti-Money Laundering), CCPA (California Consumer Privacy Act), and local lending caps in three different foreign jurisdictions.
        Licensing: We are currently operating under a "sandbox" agreement in the target foreign markets, which expires in 6 months.
        Internal Governance: The project has been fast-tracked. A full Privacy Impact Assessment (PIA) is scheduled but will not be completed until 30 days post-launch.`
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