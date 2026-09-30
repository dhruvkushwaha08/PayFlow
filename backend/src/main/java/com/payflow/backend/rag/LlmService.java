package com.payflow.backend.rag;

public interface LlmService {

    String generateAnswer(
            String question,
            String context
    );
}