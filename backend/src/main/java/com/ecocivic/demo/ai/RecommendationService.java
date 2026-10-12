package com.ecocivic.demo.ai;

import org.springframework.stereotype.Service;

/**
 * Generates actionable recommendations for resolving a complaint.
 * Intended for the authority dashboard.
 */
@Service
public class RecommendationService {

    private final GeminiClient geminiClient;

    public RecommendationService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * Given a complaint and its category, returns 3-5 bullet-point
     * recommendations for the responsible authority.
     *
     * @param complaintText the raw complaint description
     * @param category      the classified category of the complaint
     * @return multi-line recommendation text
     */
    public String recommend(String complaintText, String category) {
        String prompt = """
                You are an environmental governance advisor.
                
                A citizen has filed a complaint under the category "%s":
                "%s"
                
                Provide 3-5 concise, actionable recommendations for the local
                government authority to resolve this issue. Use bullet points.
                """.formatted(category, complaintText);

        return geminiClient.generate(prompt);
    }
}
