package com.whosdrunk.auth;

import com.whosdrunk.auth.dto.AuthResponse;
import com.whosdrunk.auth.dto.LoginRequest;
import com.whosdrunk.auth.dto.RegisterRequest;
import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.user.User;
import com.whosdrunk.repository.UserRepository;
import com.whosdrunk.security.AuthPrincipal;
import com.whosdrunk.security.JwtService;
import com.whosdrunk.security.TokenType;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalizeEmail(req.email());

        if (!isAdult(req.birthDate())) {
            throw AppException.unprocessable("Debes ser mayor de 18 años para registrarte");
        }
        if (users.existsByEmail(email)) {
            throw AppException.conflict("Ya existe una cuenta con ese email");
        }

        User user = User.builder()
                .email(email)
                .displayName(req.displayName().trim())
                .birthDate(req.birthDate())
                .authProvider("LOCAL")
                .passwordHash(passwordEncoder.encode(req.password()))
                .build();
        users.save(user);

        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.email());
        // Mensaje genérico para no filtrar si el email existe.
        User user = users.findByEmail(email)
                .orElseThrow(() -> AppException.unauthorized("Credenciales inválidas"));

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw AppException.unauthorized("Credenciales inválidas");
        }
        return tokensFor(user);
    }

    /** Emite un nuevo par de tokens a partir de un refresh token válido. */
    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        AuthPrincipal principal;
        try {
            principal = jwtService.parse(refreshToken, TokenType.REFRESH);
        } catch (JwtException | IllegalArgumentException ex) {
            throw AppException.unauthorized("Refresh token inválido o caducado");
        }
        User user = users.findById(principal.userId())
                .orElseThrow(() -> AppException.unauthorized("Usuario no encontrado"));
        return tokensFor(user);
    }

    private AuthResponse tokensFor(User user) {
        return new AuthResponse(
                user.getId(),
                user.getDisplayName(),
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                "Bearer",
                jwtService.accessTtlSeconds());
    }

    private static boolean isAdult(LocalDate birthDate) {
        return Period.between(birthDate, LocalDate.now()).getYears() >= 18;
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
