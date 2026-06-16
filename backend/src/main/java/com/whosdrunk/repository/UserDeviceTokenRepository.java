package com.whosdrunk.repository;

import com.whosdrunk.domain.notification.UserDeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, UUID> {

    Optional<UserDeviceToken> findByToken(String token);

    List<UserDeviceToken> findByUserId(UUID userId);

    @Query("SELECT t.token FROM UserDeviceToken t WHERE t.user.id = :userId")
    List<String> findTokensByUserId(@Param("userId") UUID userId);
}
