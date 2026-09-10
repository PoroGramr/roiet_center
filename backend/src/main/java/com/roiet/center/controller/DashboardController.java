package com.roiet.center.controller;
import com.roiet.center.dto.DashboardDtos.Response;
import com.roiet.center.service.DashboardService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/dashboard")
public class DashboardController {private final DashboardService service;public DashboardController(DashboardService s){service=s;}@GetMapping public Response get(){return service.get();}}

