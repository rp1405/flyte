package com.flyte.backend.repository;

import com.flyte.backend.model.UserDeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, UUID> {
    List<UserDeviceToken> findByUserId(UUID userId);
    void deleteByFcmToken(String fcmToken);
}
