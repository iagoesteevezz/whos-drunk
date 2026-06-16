package com.whosdrunk.api;

import com.whosdrunk.api.dto.RegisterDeviceTokenRequest;
import com.whosdrunk.notification.DeviceTokenService;
import com.whosdrunk.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me/device-tokens")
public class UserDeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    public UserDeviceTokenController(DeviceTokenService deviceTokenService) {
        this.deviceTokenService = deviceTokenService;
    }

    /** Registers (or refreshes) the caller's Expo push token. */
    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void register(@AuthenticationPrincipal AuthPrincipal me,
                         @Valid @RequestBody RegisterDeviceTokenRequest req) {
        deviceTokenService.register(me.userId(), req.token(), req.platformOrDefault());
    }
}
