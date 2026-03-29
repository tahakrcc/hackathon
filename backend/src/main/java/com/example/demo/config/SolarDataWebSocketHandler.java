package com.example.demo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Slf4j
@Component
public class SolarDataWebSocketHandler extends TextWebSocketHandler {

    // Thread-safe collection for active sessions
    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final ObjectMapper objectMapper;

    public SolarDataWebSocketHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules(); // Auto-registers JavaTimeModule
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("[WS] Yeni tünel bağlantısı açıldı: {}. Toplam cihaz: {}", session.getId(), sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("[WS] Bağlantı sonlandı: {}. Kalan cihaz: {}", session.getId(), sessions.size());
    }

    /**
     * Elde edilen veriyi bağlı olan tüm kullanıcılara JSON formatında mili-saniyede fırlatır.
     */
    public void broadcast(Object payload) {
        if (sessions.isEmpty()) {
            return; // Bağlı kimse yoksa boşuna işlem yapma
        }
        try {
            String jsonMessage = objectMapper.writeValueAsString(payload);
            TextMessage message = new TextMessage(jsonMessage);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    session.sendMessage(message);
                }
            }
        } catch (Exception e) {
            log.error("[WS] Yayın (Broadcast) yapılamadı!", e);
        }
    }
}
