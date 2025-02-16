// openservice.js
export async function sendMessageToOpenAI(message) {
    const maxRetries = 5;  // Maximum number of retries
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer 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`  // Ensure to use Bearer
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',  // Use the correct model
                    messages: [{ role: 'user', content: message }],
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    // Wait before retrying
                    const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries); // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    retries++;
                    continue;  // Retry the request
                }
                throw new Error(`OpenAI API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("OpenAI response:", data);

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error("No response from OpenAI");
            }
        } catch (error) {
            console.error("Error sending message to OpenAI:", error);
            return "Sorry, I couldn't process your request.";
        }
    }

    return "Sorry, I couldn't process your request after multiple attempts.";
}