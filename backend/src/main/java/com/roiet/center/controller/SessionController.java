package com.roiet.center.controller;
import com.roiet.center.dto.*;
import com.roiet.center.dto.SessionDtos.*;
import com.roiet.center.service.SessionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/sessions")
public class SessionController {
 private final SessionService service; public SessionController(SessionService s){service=s;}
 @GetMapping public List<Summary> list(@RequestParam(required=false) Long teamId){return service.list(teamId);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Detail create(@Valid @RequestBody CreateRequest r,Authentication auth){return service.create(r,(Long)auth.getPrincipal());}
 @GetMapping("/{id}") public Detail get(@PathVariable Long id){return service.get(id);}
 @PatchMapping("/{id}") public Detail update(@PathVariable Long id,@Valid @RequestBody UpdateRequest r){return service.update(id,r);}
 @PutMapping("/{id}/attendance") public Detail attendance(@PathVariable Long id,@Valid @RequestBody AttendanceDtos.BulkRequest r,Authentication auth){return service.replaceAttendance(id,r,(Long)auth.getPrincipal());}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete(id);}
}

