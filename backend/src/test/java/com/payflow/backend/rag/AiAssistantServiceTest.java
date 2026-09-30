package com.payflow.backend.rag;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AiAssistantServiceTest {

    @Autowired
    private AiAssistantService aiAssistantService;

    @Test
    void shouldGenerateAnswerUsingRagContext() {

        String answer =
                aiAssistantService.ask(
                        "How is overtime compensation calculated?"
                );

        assertEquals(
                "Mock AI response based on retrieved PayFlow policy context.",
                answer
        );
    }
}