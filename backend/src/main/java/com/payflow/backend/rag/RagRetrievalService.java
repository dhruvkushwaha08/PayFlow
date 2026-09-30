package com.payflow.backend.rag;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class RagRetrievalService {

    private final EmbeddingService embeddingService;
    private final RagVectorRepository ragVectorRepository;

    public RagRetrievalService(
            EmbeddingService embeddingService,
            RagVectorRepository ragVectorRepository) {

        this.embeddingService = embeddingService;
        this.ragVectorRepository = ragVectorRepository;
    }

    public List<Map<String, Object>> retrieve(
            String query,
            int limit) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException(
                    "Query must not be empty."
            );
        }

        double[] queryEmbedding =
                embeddingService.embed(query);

        return ragVectorRepository.searchSimilar(
                queryEmbedding,
                limit
        );
    }
}