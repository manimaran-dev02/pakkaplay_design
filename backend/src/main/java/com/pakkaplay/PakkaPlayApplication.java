package com.pakkaplay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// No in-memory default user: accounts come from the identity module (Phase 2).
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class PakkaPlayApplication {

    public static void main(String[] args) {
        SpringApplication.run(PakkaPlayApplication.class, args);
    }
}
