package com.whosdrunk.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password,   // BCrypt admite hasta 72 bytes
        @NotBlank @Size(max = 80) String displayName,
        @NotNull @Past LocalDate birthDate
) {}
