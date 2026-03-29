package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SolarDataWebSocketHandler solarDataWebSocketHandler;

    public WebSocketConfig(SolarDataWebSocketHandler solarDataWebSocketHandler) {
        this.solarDataWebSocketHandler = solarDataWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Raw text (JSON) websocket handler
        // Dışarıdan bağlantıya izin vermek için setAllowedOrigins("*")
        registry.addHandler(solarDataWebSocketHandler, "/ws/solar-feed")
                .setAllowedOrigins("*");
    }
}
