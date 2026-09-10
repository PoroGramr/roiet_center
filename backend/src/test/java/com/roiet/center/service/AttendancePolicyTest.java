package com.roiet.center.service;
import com.roiet.center.config.AppProperties;
import com.roiet.center.domain.Attendance;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
class AttendancePolicyTest {
 @Test void configurableRateCountsLateAndEarlyLeave(){var props=new AppProperties(null,null,new AppProperties.Attendance(true,true),null);var policy=new ConfigurableAttendancePolicy(props);assertThat(policy.countsAsPresent(Attendance.Status.LATE)).isTrue();assertThat(policy.rate(4,3)).isEqualTo(75.0);}
 @Test void emptyRateIsZero(){var props=new AppProperties(null,null,new AppProperties.Attendance(false,false),null);assertThat(new ConfigurableAttendancePolicy(props).rate(0,0)).isZero();}
}
