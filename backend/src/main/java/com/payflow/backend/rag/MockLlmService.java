package com.payflow.backend.rag;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"test", "ingest"})
public class MockLlmService implements LlmService {

    @Override
    public String generateAnswer(
            String question,
            String context) {

        return "Mock AI response based on retrieved PayFlow policy context.";
    }
}
