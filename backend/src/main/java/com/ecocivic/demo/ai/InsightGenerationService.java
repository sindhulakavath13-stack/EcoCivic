package com.ecocivic.demo.ai;

import org.springframework.stereotype.Service;

/**
 * Generates trend insights and analytics summaries from complaint data.
 * Intended for the admin dashboard.
 */
@Service
public class InsightGenerationService {

    private final GeminiClient geminiClient;

    public InsightGenerationService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * Generates a narrative insight report from aggregated complaint statistics.
     *
     * @param statsJson a JSON or structured string of complaint statistics
     * @return a human-readable insight report
     */
    public String generateInsight(String statsJson) {
        String prompt = """
                You are an environmental data analyst.
                
                The following is a summary of sustainability complaints received
                in a community:
                
                %s
                
                Write a short insight report (3-5 sentences) highlighting key trends,
                the most urgent categories, and suggestions for priority action.
                """.formatted(statsJson);

        return geminiClient.generate(prompt);
    }
}
