package com.payflow.backend.rag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    public AiAssistantController(
            AiAssistantService aiAssistantService) {

        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/ask")
    public ResponseEntity<AiAskResponse> ask(
            @Valid @RequestBody AiAskRequest request) {

        String answer =
                aiAssistantService.ask(request.question());

        return ResponseEntity.ok(
                new AiAskResponse(answer)
        );
    }

    public record AiAskRequest(
            @NotBlank(message = "Question must not be empty")
            String question
    ) {
    }

    public record AiAskResponse(
            String answer
    ) {
    }
}