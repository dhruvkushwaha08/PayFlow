package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmbeddingServiceTest {

    @Autowired
    private EmbeddingService embeddingService;

    @Test
    void shouldGenerateEmbedding() {

        double[] embedding =
                embeddingService.embed(
                        "PayFlow payroll attendance policy"
                );

        assertNotNull(embedding);
        assertEquals(384, embedding.length);
    }
}