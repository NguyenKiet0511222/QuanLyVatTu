package com.qlthietbi.util;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class JwtUtil {
    // Một khóa bí mật đủ mạnh để mã hóa chữ ký JWT HS256
    private static final String SECRET_KEY = "YourSuperSecretKeyForJWTTokenGenerationEnsureItIsLongEnough";

    /**
     * Tạo JWT token chứa thông tin username và role
     */
    public static String generateToken(String username, String role) {
        try {
            // 1. Tạo JWT Header (HS256)
            String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(header.getBytes(StandardCharsets.UTF_8));

            // 2. Tạo JWT Payload (Claims)
            long now = System.currentTimeMillis() / 1000;
            long exp = now + 86400; // Hết hạn sau 1 ngày (86400 giây)
            String payload = String.format("{\"sub\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}", username, role, now, exp);
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));

            // 3. Tạo Signature (Chữ ký HS256)
            String signatureInput = encodedHeader + "." + encodedPayload;
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKeySpec);
            byte[] signatureBytes = sha256HMAC.doFinal(signatureInput.getBytes(StandardCharsets.UTF_8));
            String encodedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);

            // 4. Kết hợp Header, Payload, Signature thành JWT hoàn chỉnh
            return encodedHeader + "." + encodedPayload + "." + encodedSignature;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }
}
