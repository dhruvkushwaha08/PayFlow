package com.payflow.backend.rag;

import java.util.List;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    public EmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public double[] embed(String text) {

        float[] embedding = embeddingModel.embed(text);

        double[] result = new double[embedding.length];

        for (int i = 0; i < embedding.length; i++) {
            result[i] = embedding[i];
        }

        return result;
    }
}