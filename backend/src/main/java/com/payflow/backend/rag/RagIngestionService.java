package com.payflow.backend.rag;

import org.springframework.stereotype.Service;

@Service
public class RagIngestionService {

    private final EmbeddingService embeddingService;
    private final RagVectorRepository ragVectorRepository;

    public RagIngestionService(
            EmbeddingService embeddingService,
            RagVectorRepository ragVectorRepository) {

        this.embeddingService = embeddingService;
        this.ragVectorRepository = ragVectorRepository;
    }

    public void addDocumentChunk(
            String content,
            String metadataJson) {

        double[] embedding =
                embeddingService.embed(content);

        ragVectorRepository.saveChunk(
                content,
                metadataJson,
                embedding
        );
    }
}