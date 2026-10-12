package com.ecocivic.demo.ai;

import org.springframework.stereotype.Service;

/**
 * Generates a concise AI summary of a complaint description.
 * Used when a new report is created.
 */
@Service
public class SummaryService {

    private final GeminiClient geminiClient;

    public SummaryService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * Summarises the given complaint text in 2-3 sentences.
     *
     * @param complaintText the raw complaint description from the user
     * @return a short AI-generated summary
     */
    public String summarise(String complaintText) {
        String prompt = """
                You are an environmental governance assistant.
                A citizen has submitted the following sustainability complaint:
                
                "%s"
                
                Please provide a concise 2-3 sentence summary of the core issue,
                written for a government authority reviewing the complaint.
                """.formatted(complaintText);

        return geminiClient.generate(prompt);
    }
}
