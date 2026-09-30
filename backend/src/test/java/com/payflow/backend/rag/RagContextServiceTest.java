package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RagContextServiceTest {

    @Autowired
    private RagContextService ragContextService;

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