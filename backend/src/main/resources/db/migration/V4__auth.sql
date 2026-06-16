-- =====================================================================
-- V4: Autenticación local (hash de contraseña)
-- =====================================================================

-- Hash BCrypt de la contraseña. Nullable: los usuarios que entran por
-- proveedores sociales (GOOGLE/APPLE) no tienen contraseña local.
ALTER TABLE users ADD COLUMN password_hash VARCHAR(100);

-- Un usuario LOCAL debe tener contraseña; los sociales no.
ALTER TABLE users ADD CONSTRAINT chk_local_user_has_password
    CHECK (auth_provider <> 'LOCAL' OR password_hash IS NOT NULL);
