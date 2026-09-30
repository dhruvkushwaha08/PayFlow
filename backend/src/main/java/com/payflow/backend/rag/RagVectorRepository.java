package com.payflow.backend.rag;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RagVectorRepository {

    private final JdbcTemplate ragJdbcTemplate;

    public RagVectorRepository(JdbcTemplate ragJdbcTemplate) {
        this.ragJdbcTemplate = ragJdbcTemplate;
    }

    public void saveChunk(
            String content,
            String metadataJson,
            double[] embedding) {

        validateEmbedding(embedding);

        String embeddingString = toVectorString(embedding);

        String sql = """
                INSERT INTO vector_store (content, metadata, embedding)
                VALUES (?, ?::jsonb, ?::vector)
                """;

        ragJdbcTemplate.update(
                sql,
                content,
                metadataJson,
                embeddingString
        );
    }

    public List<Map<String, Object>> searchSimilar(
            double[] embedding,
            int limit) {

        validateEmbedding(embedding);

        String embeddingString = toVectorString(embedding);

        String sql = """
                SELECT
                    id,
                    content,
                    metadata,
                    1 - (embedding <=> ?::vector) AS similarity
                FROM vector_store
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;

        return ragJdbcTemplate.queryForList(
                sql,
                embeddingString,
                embeddingString,
                limit
        );
    }

    public void deleteAll() {
        ragJdbcTemplate.update(
                "DELETE FROM vector_store"
        );
    }

    private void validateEmbedding(double[] embedding) {

        if (embedding == null || embedding.length != 384) {
            throw new IllegalArgumentException(
                    "Embedding must contain exactly 384 dimensions."
            );
        }
    }

    private String toVectorString(double[] embedding) {

        StringBuilder result = new StringBuilder("[");

        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) {
                result.append(",");
            }

            result.append(embedding[i]);
        }

        result.append("]");

        return result.toString();
    }
}