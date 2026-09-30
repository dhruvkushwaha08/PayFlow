package com.payflow.backend.rag;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class RagContextService {

    private final RagRetrievalService ragRetrievalService;

    public RagContextService(
            RagRetrievalService ragRetrievalService) {

        this.ragRetrievalService = ragRetrievalService;
    }

    public String buildContext(
            String query,
            int limit) {

        List<Map<String, Object>> results =
                ragRetrievalService.retrieve(query, limit);

        if (results.isEmpty()) {
            return "";
        }

        StringBuilder context =
                new StringBuilder();

        for (int i = 0; i < results.size(); i++) {

            Map<String, Object> result =
                    results.get(i);

            context.append("SOURCE ")
                    .append(i + 1)
                    .append("\n");

            context.append(result.get("content"))
                    .append("\n\n");
        }

        return context.toString().trim();
    }
}