package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RagRetrievalServiceTest {

    @Autowired
    private RagRetrievalService ragRetrievalService;

    @Test
    void shouldRetrieveRelevantPolicy() {

        List<Map<String, Object>> results =
                ragRetrievalService.retrieve(
                        "How is overtime compensation calculated?",
                        3
                );

        assertNotNull(results);
        assertFalse(results.isEmpty());

        System.out.println("===== RAG RETRIEVAL RESULTS =====");

        for (Map<String, Object> result : results) {
            System.out.println("Content: "
                    + result.get("content"));

            System.out.println("Similarity: "
                    + result.get("similarity"));

            System.out.println("Metadata: "
                    + result.get("metadata"));

            System.out.println("--------------------------------");
        }
    }
}