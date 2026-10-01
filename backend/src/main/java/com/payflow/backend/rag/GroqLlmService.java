package com.payflow.backend.rag;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!test & !ingest")
public class GroqLlmService implements LlmService {

    private final ChatModel chatModel;

    public GroqLlmService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public String generateAnswer(
            String question,
            String context) {

        String prompt = """
                You are the PayFlow AI Assistant.

                Your job is to answer questions using ONLY the PayFlow policy
                context provided below.

                Rules:
                - Do not invent or assume policy information.
                - If the answer is not present in the provided context,
                  clearly say that the information is not available in the
                  current PayFlow policy documents.
                - Do not modify payroll, attendance, financial records,
                  employee records, or any other system data.
                - Give a clear and concise answer.
                - Treat the retrieved context as the source of truth.

                PayFlow Policy Context:
                %s

                User Question:
                %s
                """.formatted(context, question);

        ChatResponse response = chatModel.call(new Prompt(prompt));

        return response.getResult()
                .getOutput()
                .getText();
    }
}