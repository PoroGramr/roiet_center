package com.roiet.center.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
@ConfigurationProperties("app")
public record AppProperties(Jwt jwt, Cors cors, Attendance attendance, Alerts alerts) {
 public record Jwt(String secret,long expirationMinutes) {}
 public record Cors(String allowedOrigin) {}
 public record Attendance(boolean lateCountsAsPresent,boolean earlyLeaveCountsAsPresent) {}
 public record Alerts(int consecutiveAbsences,int recentSessionWindow,int absencesInWindow,int inactiveDays) {}
}
