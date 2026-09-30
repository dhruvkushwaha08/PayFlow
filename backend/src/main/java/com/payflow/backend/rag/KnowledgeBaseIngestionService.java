package com.payflow.backend.rag;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class KnowledgeBaseIngestionService {

    private final TextChunker textChunker;
    private final EmbeddingService embeddingService;
    private final RagVectorRepository ragVectorRepository;

    public KnowledgeBaseIngestionService(
            TextChunker textChunker,
            EmbeddingService embeddingService,
            RagVectorRepository ragVectorRepository) {

        this.textChunker = textChunker;
        this.embeddingService = embeddingService;
        this.ragVectorRepository = ragVectorRepository;
    }

    public void ingestFile(Path filePath) throws IOException {

        String content = Files.readString(filePath);

        List<String> chunks = textChunker.chunk(content);

        for (int i = 0; i < chunks.size(); i++) {

            String chunk = chunks.get(i);

            String metadata = """
                    {
                        "source": "%s",
                        "chunk": %d
                    }
                    """.formatted(
                    filePath.getFileName(),
                    i + 1
            );

            double[] embedding =
                    embeddingService.embed(chunk);

            ragVectorRepository.saveChunk(
                    chunk,
                    metadata,
                    embedding
            );
        }
    }
}