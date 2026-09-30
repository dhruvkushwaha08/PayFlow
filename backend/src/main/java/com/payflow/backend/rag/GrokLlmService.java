package com.payflow.backend.rag;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("grok")
public class GrokLlmService implements LlmService {

    private final ChatClient chatClient;

    public GrokLlmService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public String generateAnswer(
            String question,
            String context) {

        String prompt = """
                You are the PayFlow AI assistant.

                Answer the user's question using ONLY the provided
                PayFlow policy context.

                Rules:
                - Do not invent company policies.
                - If the context does not contain enough information,
                  clearly say that the policy information is not available.
                - Do not modify payroll, attendance, advances, bonuses,
                  overtime, or any other records.
                - Keep the answer clear and concise.

                PAYFLOW POLICY CONTEXT:
                %s

                USER QUESTION:
                %s
                """.formatted(context, question);

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}