export async function sendMessageToOpenAI(message) {
    const response = await fetch('https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '16b150dfc1msh78e9ff33a91acbap12c8eejsn3430e15463261',  // Replace with your actual RapidAPI key
            'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            model: 'gpt-4',  // Use the correct model
            max_tokens: 100,
            temperature: 0.9
        })
    });

    if (!response.ok) {
        const errorBody = await response.text(); // Log the error response
        console.error('Error response:', errorBody);
        throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    if (responseData.choices && responseData.choices.length > 0) {
        return responseData.choices[0].message.content.trim();
    } else {
        throw new Error("No response from OpenAI");
    }
}