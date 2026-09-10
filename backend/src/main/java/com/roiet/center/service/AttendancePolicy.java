package com.roiet.center.service;
import com.roiet.center.domain.Attendance;
public interface AttendancePolicy { boolean countsAsPresent(Attendance.Status status); double rate(long total,long credited); }

