package com.payflow.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // Disable CSRF because PayFlow uses JWT authentication
            .csrf(AbstractHttpConfigurer::disable)

            // Enable CORS using CorsConfig.java
            .cors(Customizer.withDefaults())

            // Disable default Spring login page
            .formLogin(AbstractHttpConfigurer::disable)

            // Disable HTTP Basic authentication
            .httpBasic(AbstractHttpConfigurer::disable)

            // JWT authentication is stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()

                // Login is publicly accessible
                .requestMatchers("/api/auth/login")
                .permitAll()

                // Employee management
                .requestMatchers("/api/employees/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // Attendance management
                .requestMatchers("/api/attendance/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // Advance management
                .requestMatchers("/api/advances/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // Bonus management
                .requestMatchers("/api/bonuses/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // Overtime management
                .requestMatchers("/api/overtime/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // Payroll management
                .requestMatchers("/api/payroll/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // Salary structure management
                .requestMatchers("/api/salary-structures/**")
                .hasAnyRole("ADMIN", "MANAGER")

                // All other API requests require authentication
                .anyRequest()
                .authenticated()
            )

            // JWT filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}