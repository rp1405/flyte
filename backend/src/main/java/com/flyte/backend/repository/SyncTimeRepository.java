package com.flyte.backend.repository;

import com.flyte.backend.model.SyncTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SyncTimeRepository extends JpaRepository<SyncTime, UUID> {
    Optional<SyncTime> findByUserId(UUID userId);
}
