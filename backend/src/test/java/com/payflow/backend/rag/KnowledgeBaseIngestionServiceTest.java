package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertFalse;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class KnowledgeBaseIngestionServiceTest {

    @Autowired
    private KnowledgeBaseIngestionService ingestionService;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private RagVectorRepository ragVectorRepository;

    @AfterEach
    void cleanup() {
        ragVectorRepository.deleteAll();
    }

    @Test
    void shouldIngestPayrollPolicy() throws Exception {

        Path policyFile =
                Path.of("../knowledge/payroll-policy.txt");

        ingestionService.ingestFile(policyFile);

        double[] queryEmbedding =
                embeddingService.embed(
                        "How is earned salary calculated?"
                );

        List<Map<String, Object>> results =
                ragVectorRepository.searchSimilar(
                        queryEmbedding,
                        3
                );

        assertFalse(results.isEmpty());
    }
}