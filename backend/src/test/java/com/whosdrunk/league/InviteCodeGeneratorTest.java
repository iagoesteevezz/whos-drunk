package com.whosdrunk.league;

import com.whosdrunk.repository.LeagueRepository;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InviteCodeGeneratorTest {

    private final LeagueRepository leagues = mock(LeagueRepository.class);
    private final InviteCodeGenerator generator = new InviteCodeGenerator(leagues);

    @Test
    void generaCodigoDe8CaracteresSinAmbiguos() {
        when(leagues.existsByInviteCode(anyString())).thenReturn(false);
        String code = generator.generateUnique();

        assertEquals(8, code.length());
        // sin caracteres ambiguos: 0, O, 1, I, L
        assertFalse(code.matches(".*[01OIL].*"), "El código no debe contener 0/1/O/I/L: " + code);
        assertTrue(code.matches("[A-Z2-9]+"), "Solo mayúsculas y dígitos 2-9: " + code);
    }

    @Test
    void reintentaAnteColisionYDevuelveUnoLibre() {
        // Las dos primeras comprobaciones colisionan, la tercera está libre.
        when(leagues.existsByInviteCode(anyString()))
                .thenReturn(true, true, false);

        String code = generator.generateUnique();

        assertNotNull(code);
        verify(leagues, times(3)).existsByInviteCode(anyString());
    }

    @Test
    void lanzaSiNoEncuentraCodigoLibre() {
        when(leagues.existsByInviteCode(anyString())).thenReturn(true); // siempre colisión
        assertThrows(IllegalStateException.class, generator::generateUnique);
    }

    @Test
    void normalizeQuitaEspaciosGuionesYPasaAMayusculas() {
        assertEquals("ABCD2345", InviteCodeGenerator.normalize("  abcd-2345 "));
        assertEquals("ABCD2345", InviteCodeGenerator.normalize("ab cd 23 45"));
        assertEquals("", InviteCodeGenerator.normalize(null));
    }

    @Test
    void codigosRazonablementeUnicos() {
        when(leagues.existsByInviteCode(anyString())).thenReturn(false);
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < 1000; i++) {
            seen.add(generator.generateUnique());
        }
        // Con 31^8 combinaciones, 1000 códigos no deberían colisionar.
        assertEquals(1000, seen.size());
    }
}
