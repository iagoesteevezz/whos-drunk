package com.whosdrunk.notification;

import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.notification.UserDeviceToken;
import com.whosdrunk.domain.user.User;
import com.whosdrunk.repository.UserDeviceTokenRepository;
import com.whosdrunk.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class DeviceTokenService {

    private final UserDeviceTokenRepository deviceTokens;
    private final UserRepository users;

    public DeviceTokenService(UserDeviceTokenRepository deviceTokens, UserRepository users) {
        this.deviceTokens = deviceTokens;
        this.users = users;
    }

    /**
     * Idempotent registration. A token is globally unique, so if it already
     * exists we re-point it to the current user (device handed over / re-login)
     * and refresh its metadata.
     */
    @Transactional
    public void register(UUID userId, String token, String platform) {
        User user = users.findById(userId)
                .orElseThrow(() -> AppException.unauthorized("User not found"));

        UserDeviceToken entity = deviceTokens.findByToken(token)
                .orElseGet(() -> UserDeviceToken.builder().token(token).build());

        entity.setUser(user);
        entity.setPlatform(platform);
        entity.setLastSeenAt(Instant.now());
        deviceTokens.save(entity);
    }
}
