package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RagVectorRepositoryTest {

    @Autowired
    private RagVectorRepository ragVectorRepository;

    @Test
    void shouldSaveAndSearchVector() {

        double[] embedding = new double[384];
        embedding[0] = 1.0;

        ragVectorRepository.saveChunk(
                "PayFlow test policy chunk",
                "{\"source\":\"test\"}",
                embedding
        );

        List<Map<String, Object>> results =
                ragVectorRepository.searchSimilar(embedding, 1);

        assertFalse(results.isEmpty());

        assertEquals(
                "PayFlow test policy chunk",
                results.get(0).get("content")
        );
    }
}