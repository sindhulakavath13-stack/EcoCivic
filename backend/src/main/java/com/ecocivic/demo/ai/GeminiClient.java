package com.ecocivic.demo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Low-level HTTP client for Google Gemini generateContent API.
 * All AI services delegate to this client instead of calling the API directly.
 */
@Component
public class GeminiClient {

    private final RestClient restClient;

    @Value("${ai.gemini.api.key}")
    private String apiKey;

    @Value("${ai.gemini.model}")
    private String model;

    @Value("${ai.gemini.base-url}")
    private String baseUrl;

    public GeminiClient(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Sends a single-turn prompt to Gemini and returns the text response.
     *
     * @param prompt the full prompt string
     * @return the generated text from the model
     */
    public String generate(String prompt) {
        String url = baseUrl + "/" + model + ":generateContent";

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        Map<?, ?> response = restClient.post()
                .uri(url)
                .header("X-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            return "No response received from Gemini.";
        }

        try {
            List<?> candidates = (List<?>) response.get("candidates");
            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> contentMap = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) contentMap.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            return String.valueOf(firstPart.get("text"));
        } catch (Exception e) {
            return "Failed to parse Gemini response.";
        }
    }
}
