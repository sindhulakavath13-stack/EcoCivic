package com.ecocivic.demo.ai;

import org.springframework.stereotype.Service;

/**
 * Conversational AI chat service.
 * Handles open-ended citizen/admin questions about sustainability.
 */
@Service
public class AiChatService {

    private final GeminiClient geminiClient;

    public AiChatService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * Answers a free-text question in the context of urban sustainability
     * and civic governance.
     *
     * @param message the user's question or message
     * @return the AI-generated response
     */
    public String chat(String message) {
        if (message == null || message.isBlank()) {
            return "Please enter a question.";
        }

        String prompt = """
                You are EcoCivic AI, a helpful assistant specialising in urban sustainability,
                environmental issues, and civic governance.
                
                Answer the following question clearly and helpfully:
                "%s"
                """.formatted(message);

        return geminiClient.generate(prompt);
    }
}
