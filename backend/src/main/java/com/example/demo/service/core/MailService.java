package com.example.demo.service.core;

import com.example.demo.model.entity.RecipientMail;
import com.example.demo.repository.RecipientMailRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;
    private final RecipientMailRepository recipientMailRepository;

    public List<String> getAllRecipients() {
        return recipientMailRepository.findAll().stream()
                .map(RecipientMail::getEmail)
                .toList();
    }

    @Transactional
    public void addRecipient(String email) {
        if (recipientMailRepository.findByEmail(email).isEmpty()) {
            recipientMailRepository.save(new RecipientMail(email));
            log.info("[MAIL_DB] Yeni alıcı kaydedildi: {}", email);
        }
    }

    @Transactional
    public void removeRecipient(String email) {
        recipientMailRepository.deleteByEmail(email);
        log.info("[MAIL_DB] Alıcı silindi: {}", email);
    }

    public void sendEmergencyAlert(List<String> recipients, String intensity, String aiComment, String impactTime) {
        if (recipients == null || recipients.isEmpty()) {
            log.warn("[MAIL] Alıcı listesi boş, gönderim iptal edildi.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlContent = String.format(
                "<div style='font-family: Arial, sans-serif; background-color: #0c0c0c; color: #ffffff; padding: 40px; border: 2px solid #ff003c; border-radius: 12px;'>" +
                "  <h1 style='color: #ff003c; text-transform: uppercase; letter-spacing: 5px;'>KIRMIZI ALARM - SOLAR OBSERVER</h1>" +
                "  <hr style='border: 0.5px solid #333; margin: 20px 0;'>" +
                "  <p style='font-size: 14px; color: #888;'>Sistem tarafından otomatik olarak oluşturulan acil durum raporudur.</p>" +
                "  <div style='background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 20px;'>" +
                "    <p><strong>Şiddet Endeksi:</strong> <span style='color: #ff003c; font-size: 20px;'>%s</span></p>" +
                "    <p><strong>Yapay Zeka Analizi:</strong> <br><i style='color: #ccc;'>\"%s\"</i></p>" +
                "    <p><strong>Tahmini Etki Süresi:</strong> %s</p>" +
                "  </div>" +
                "  <div style='margin-top: 30px; padding: 15px; border-left: 4px solid #ff003c; background: #220002;'>" +
                "    <p style='font-size: 12px; margin: 0;'><b>ÖNERİLEN AKSİYONLAR:</b></p>" +
                "    <ul style='font-size: 12px; color: #bbb;'>" +
                "      <li>Uydu operasyonlarını 'Safe Mode' konumuna alın.</li>" +
                "      <li>Güç şebekelerinde kontrollü yük dengelemesi başlatın.</li>" +
                "      <li>Hassas yörünge manevralarını durdurun.</li>" +
                "    </ul>" +
                "  </div>" +
                "  <p style='font-size: 10px; color: #555; margin-top: 40px;'>Bu e-posta Solar Observer v1.5 SİBER_OS üzerinden gönderilmiştir.</p>" +
                "</div>",
                intensity, aiComment, impactTime
            );

            helper.setSubject("⚠️ KRİTİK UYARI: Güneş Fırtınası Tespit Edildi!");
            helper.setText(htmlContent, true);
            helper.setTo(recipients.toArray(new String[0]));

            mailSender.send(message);
            log.info("[MAIL] Acil durum bildirimi {} adrese gönderildi.", recipients.size());

        } catch (MessagingException e) {
            log.error("[MAIL] Gönderim hatası: {}", e.getMessage());
        }
    }
}
