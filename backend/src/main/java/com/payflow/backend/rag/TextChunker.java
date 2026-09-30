package com.payflow.backend.rag;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class TextChunker {

    private static final int MAX_CHUNK_SIZE = 500;

    public List<String> chunk(String text) {

        List<String> chunks = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return chunks;
        }

        String[] paragraphs = text.split("\\n\\s*\\n");

        StringBuilder currentChunk = new StringBuilder();

        for (String paragraph : paragraphs) {

            paragraph = paragraph.trim();

            if (paragraph.isEmpty()) {
                continue;
            }

            if (currentChunk.length() + paragraph.length() + 1
                    > MAX_CHUNK_SIZE) {

                if (!currentChunk.isEmpty()) {
                    chunks.add(currentChunk.toString().trim());
                    currentChunk.setLength(0);
                }
            }

            if (!currentChunk.isEmpty()) {
                currentChunk.append("\n\n");
            }

            currentChunk.append(paragraph);
        }

        if (!currentChunk.isEmpty()) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }
}