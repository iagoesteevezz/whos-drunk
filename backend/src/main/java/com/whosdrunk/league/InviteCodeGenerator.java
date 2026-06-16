package com.whosdrunk.league;

import com.whosdrunk.repository.LeagueRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Locale;

/**
 * Genera y normaliza códigos de invitación de liga.
 *
 * <p>Diseño "al milímetro":
 * <ul>
 *   <li><b>Alfabeto sin ambigüedad</b>: se excluyen 0/O, 1/I/L para evitar
 *       errores al teclear o dictar el código (estilo Crockford).</li>
 *   <li><b>Aleatoriedad criptográfica</b>: {@link SecureRandom}.</li>
 *   <li><b>Unicidad garantizada</b>: se reintenta ante colisión y, en última
 *       instancia, la constraint UNIQUE de la BD es el guardián definitivo.</li>
 * </ul>
 */
@Component
public class InviteCodeGenerator {

    /** 31 símbolos sin caracteres ambiguos (sin 0,O,1,I,L). */
    private static final char[] ALPHABET =
            "ABCDEFGHJKMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int CODE_LENGTH = 8;
    private static final int MAX_ATTEMPTS = 10;

    private final SecureRandom random = new SecureRandom();
    private final LeagueRepository leagues;

    public InviteCodeGenerator(LeagueRepository leagues) {
        this.leagues = leagues;
    }

    /** Devuelve un código único aún no usado por ninguna liga. */
    public String generateUnique() {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String code = randomCode();
            if (!leagues.existsByInviteCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException(
                "No se pudo generar un código de invitación único tras " + MAX_ATTEMPTS + " intentos");
    }

    /**
     * Normaliza un código tecleado por el usuario para compararlo: mayúsculas,
     * sin espacios ni guiones. (No corrige caracteres ambiguos: el alfabeto ya
     * los evita en la generación.)
     */
    public static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.trim().toUpperCase(Locale.ROOT).replaceAll("[\\s-]", "");
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(ALPHABET[random.nextInt(ALPHABET.length)]);
        }
        return sb.toString();
    }
}
