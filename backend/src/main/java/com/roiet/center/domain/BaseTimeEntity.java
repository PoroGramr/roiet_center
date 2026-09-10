package com.roiet.center.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;
@MappedSuperclass
public abstract class BaseTimeEntity {
    @Column(nullable = false, updatable = false) protected Instant createdAt;
    @Column(nullable = false) protected Instant updatedAt;
    @PrePersist void created() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate void updated() { updatedAt = Instant.now(); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
