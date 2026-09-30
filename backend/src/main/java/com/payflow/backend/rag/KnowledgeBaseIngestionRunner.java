package com.payflow.backend.rag;

import java.nio.file.Path;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("ingest")
public class KnowledgeBaseIngestionRunner implements CommandLineRunner {

    private final KnowledgeBaseIngestionService ingestionService;

    public KnowledgeBaseIngestionRunner(
            KnowledgeBaseIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @Override
    public void run(String... args) throws Exception {

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

        System.out.println("PayFlow knowledge base ingestion completed successfully.");
    }
}