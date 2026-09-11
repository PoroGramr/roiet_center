package com.roiet.center.controller;
import com.roiet.center.dto.*;
import com.roiet.center.dto.TeamDtos.*;
import com.roiet.center.service.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/teams")
public class TeamController {
 private final TeamService service; private final SessionService sessions; private final StatisticsService statistics;
 public TeamController(TeamService s,SessionService ss,StatisticsService st){service=s;sessions=ss;statistics=st;}
 @GetMapping public List<Summary> list(){return service.list();}
 @PostMapping @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.CREATED) public Summary create(@Valid @RequestBody SaveRequest r){return service.create(r);}
 @GetMapping("/{id}") public Detail get(@PathVariable Long id){return service.get(id);}
 @PatchMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Summary update(@PathVariable Long id,@Valid @RequestBody SaveRequest r){return service.update(id,r);}
 @GetMapping("/{id}/students") public List<SessionDtos.EligibleStudent> students(@PathVariable Long id,@RequestParam java.time.LocalDate date){return sessions.eligible(id,date);}
 @GetMapping("/{id}/attendance-statistics") public AttendanceDtos.TeamStatistics stats(@PathVariable Long id){return statistics.team(id);}
}
