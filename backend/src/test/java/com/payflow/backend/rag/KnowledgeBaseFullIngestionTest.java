package com.payflow.backend.rag;

import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class KnowledgeBaseFullIngestionTest {

    @Autowired
    private KnowledgeBaseIngestionService ingestionService;

    @Autowired
    private RagVectorRepository ragVectorRepository;

    @AfterEach
    void cleanup() {
        ragVectorRepository.deleteAll();
    }

    @Test
    void shouldIngestAllPolicies() throws Exception {

        ingestionService.ingestFile(
                Path.of("../knowledge/payroll-policy.txt"));

        ingestionService.ingestFile(
                Path.of("../knowledge/attendance-policy.txt"));

        ingestionService.ingestFile(
                Path.of("../knowledge/overtime-policy.txt"));

        ingestionService.ingestFile(
                Path.of("../knowledge/advance-policy.txt"));

        ingestionService.ingestFile(
                Path.of("../knowledge/bonus-policy.txt"));
    }
}