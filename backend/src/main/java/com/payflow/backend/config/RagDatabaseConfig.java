package com.payflow.backend.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import com.zaxxer.hikari.HikariDataSource;

@Configuration(proxyBeanMethods = false)
public class RagDatabaseConfig {

    // ============================================================
    // Primary Database - MySQL
    // ============================================================

    @Bean(name = "dataSource")
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password) {

        HikariDataSource dataSource =
                new HikariDataSource();

        dataSource.setJdbcUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName(
                "com.mysql.cj.jdbc.Driver"
        );

        return dataSource;
    }


    // ============================================================
    // RAG Database - PostgreSQL
    // ============================================================

    @Bean(name = "ragDataSource")
    public DataSource ragDataSource(
            @Value("${rag.datasource.url}") String url,
            @Value("${rag.datasource.username}") String username,
            @Value("${rag.datasource.password}") String password) {

        HikariDataSource dataSource =
                new HikariDataSource();

        dataSource.setJdbcUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName(
                "org.postgresql.Driver"
        );

        return dataSource;
    }


    // ============================================================
    // RAG JdbcTemplate
    // ============================================================

    @Bean(name = "ragJdbcTemplate")
    public JdbcTemplate ragJdbcTemplate(
            @Qualifier("ragDataSource")
            DataSource ragDataSource) {

        return new JdbcTemplate(ragDataSource);
    }
}