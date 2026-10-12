package com.ecocivic.demo.ai;

import org.springframework.stereotype.Service;

/**
 * Classifies a complaint into a category and assigns a priority level.
 */
@Service
public class ClassificationService {

    private final GeminiClient geminiClient;

    public ClassificationService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * Classifies the complaint into one of the standard sustainability categories
     * and returns a priority level (High / Medium / Low).
     *
     * @param complaintText the raw complaint description
     * @return JSON-style string: { "category": "...", "priority": "..." }
     */
    public String classify(String complaintText) {
        String prompt = """
                You are an AI system that classifies environmental sustainability complaints.
                
                Categories:
                - Waste Management
                - Water & Sanitation
                - Air & Noise Pollution
                - Green Environment
                - Energy & Infrastructure
                - Other
                
                Priority levels:
                - High (immediate health/safety risk)
                - Medium (significant but not urgent)
                - Low (minor inconvenience)
                
                Complaint: "%s"
                
                Respond ONLY with a JSON object with two fields:
                { "category": "<one of the categories above>", "priority": "<High|Medium|Low>" }
                """.formatted(complaintText);

        return geminiClient.generate(prompt);
    }
}
