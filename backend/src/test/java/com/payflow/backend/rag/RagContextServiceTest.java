package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RagContextServiceTest {

    @Autowired
    private RagContextService ragContextService;

    @Autowired
    private KnowledgeBaseIngestionService ingestionService;

    @Autowired
    private RagVectorRepository ragVectorRepository;

    @BeforeEach
    void setUp() throws Exception {

        // Start with a clean vector store
        ragVectorRepository.deleteAll();

        // Ingest the policy required by this test
        ingestionService.ingestFile(
                Path.of("../knowledge/overtime-policy.txt")
        );
    }

    @AfterEach
    void tearDown() {

        // Keep the database clean for the next test
        ragVectorRepository.deleteAll();
    }

    @Test
    void shouldBuildContextFromRelevantPolicies() {

        String context =
                ragContextService.buildContext(
                        "How is overtime compensation calculated?",
                        3
                );

        assertFalse(context.isBlank());

        assertTrue(context.contains("SOURCE 1"));

        assertTrue(
                context.toLowerCase()
                        .contains("overtime")
        );

        System.out.println(
                "\n===== RAG CONTEXT =====\n"
                        + context
                        + "\n=======================\n"
        );
    }
}