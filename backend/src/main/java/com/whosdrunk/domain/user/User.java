package com.whosdrunk.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "auth_provider", nullable = false)
    @Builder.Default
    private String authProvider = "LOCAL";

    @Column(name = "auth_subject")
    private String authSubject;

    /** Hash BCrypt de la contraseña (null para usuarios de proveedores sociales). */
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "responsible_use_ack", nullable = false)
    @Builder.Default
    private boolean responsibleUseAck = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    /** Gate +18: regla de dominio sobre la edad mínima. */
    public boolean isAdult() {
        return birthDate != null && Period.between(birthDate, LocalDate.now()).getYears() >= 18;
    }
}
