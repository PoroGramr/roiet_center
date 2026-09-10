package com.roiet.center.controller;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @Transactional
class TeamApiIntegrationTest {
 @Autowired MockMvc mvc;
 @Test @WithMockUser(roles="ADMIN") void createsAndListsTeam() throws Exception {
  mvc.perform(post("/api/teams").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"새 팀\",\"description\":\"설명\"}" )).andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("새 팀"));
  mvc.perform(get("/api/teams")).andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("새 팀"));
 }
 @Test void requiresAuthentication() throws Exception {mvc.perform(get("/api/teams")).andExpect(status().isUnauthorized());}
}
