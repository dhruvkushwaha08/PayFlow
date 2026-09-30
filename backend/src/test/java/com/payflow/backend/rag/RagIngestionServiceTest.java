package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RagIngestionServiceTest {

    @Autowired
    private RagIngestionService ragIngestionService;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private RagVectorRepository ragVectorRepository;

    @Test
    void shouldIngestAndFindDocumentChunk() {

        String content =
                "Employees must receive overtime pay according to the company overtime policy.";

        String metadata =
                "{\"source\":\"overtime-policy.pdf\",\"section\":\"Overtime\"}";

        ragIngestionService.addDocumentChunk(
                content,
                metadata
        );

        double[] queryEmbedding =
                embeddingService.embed(content);

        List<Map<String, Object>> results =
                ragVectorRepository.searchSimilar(
                        queryEmbedding,
                        1
                );

        assertFalse(results.isEmpty());

        assertEquals(
                content,
                results.get(0).get("content")
        );
    }
}