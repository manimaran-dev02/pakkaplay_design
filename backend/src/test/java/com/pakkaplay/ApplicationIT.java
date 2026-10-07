package com.pakkaplay;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.pakkaplay.support.TestcontainersConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

/** Boots the full application against real PostgreSQL and Redis. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestcontainersConfig.class)
class ApplicationIT {

    @Autowired
    TestRestTemplate http;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    CacheManager cacheManager;

    @Test
    void healthIsUpAndPublic() {
        var response = http.getForEntity("/actuator/health", JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().path("status").asText()).isEqualTo("UP");
    }

    @Test
    void flywayBaselineMigrationIsApplied() {
        var extensions = jdbc.queryForList("SELECT extname FROM pg_extension", String.class);
        var version = jdbc.queryForObject(
                "SELECT version FROM flyway_schema_history WHERE success ORDER BY installed_rank DESC LIMIT 1",
                String.class);

        assertThat(extensions).contains("pgcrypto", "citext");
        assertThat(version).isEqualTo("1");
    }

    @Test
    void openApiDocumentIsPublic() {
        var response = http.getForEntity("/v3/api-docs", JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().path("info").path("title").asText()).isEqualTo("Pakka Play API");
    }

    @Test
    void protectedEndpointReturnsApiErrorWhenUnauthenticated() {
        var response = http.getForEntity("/api/v1/players", JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().path("code").asText()).isEqualTo("UNAUTHORIZED");
        assertThat(response.getBody().path("path").asText()).isEqualTo("/api/v1/players");
        assertThat(response.getBody().has("timestamp")).isTrue();
    }

    @Test
    void cacheIsBackedByRedis() {
        assertThat(cacheManager).isInstanceOf(RedisCacheManager.class);

        var cache = cacheManager.getCache("it-smoke");
        cache.put("key", "value");
        assertThat(cache.get("key", String.class)).isEqualTo("value");
        cache.evict("key");
    }
}
