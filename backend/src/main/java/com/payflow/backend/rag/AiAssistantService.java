package com.payflow.backend.rag;

import org.springframework.stereotype.Service;

@Service
public class AiAssistantService {

    private final RagContextService ragContextService;
    private final LlmService llmService;

    public AiAssistantService(
            RagContextService ragContextService,
            LlmService llmService) {

        this.ragContextService = ragContextService;
        this.llmService = llmService;
    }

    public String ask(String question) {

        String context =
                ragContextService.buildContext(
                        question,
                        3
                );

        return llmService.generateAnswer(
                question,
                context
        );
    }
}