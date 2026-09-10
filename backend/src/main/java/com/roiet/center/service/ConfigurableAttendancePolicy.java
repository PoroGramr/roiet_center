package com.roiet.center.service;
import com.roiet.center.config.AppProperties;
import com.roiet.center.domain.Attendance;
import org.springframework.stereotype.Component;
@Component
public class ConfigurableAttendancePolicy implements AttendancePolicy {
 private final AppProperties properties;
 public ConfigurableAttendancePolicy(AppProperties properties){this.properties=properties;}
 public boolean countsAsPresent(Attendance.Status s){return s==Attendance.Status.PRESENT||(s==Attendance.Status.LATE&&properties.attendance().lateCountsAsPresent())||(s==Attendance.Status.EARLY_LEAVE&&properties.attendance().earlyLeaveCountsAsPresent());}
 public double rate(long total,long credited){return total==0?0:Math.round(credited*1000.0/total)/10.0;}
}

