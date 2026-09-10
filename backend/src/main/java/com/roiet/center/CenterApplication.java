package com.roiet.center;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CenterApplication {
    public static void main(String[] args) { SpringApplication.run(CenterApplication.class, args); }
}

