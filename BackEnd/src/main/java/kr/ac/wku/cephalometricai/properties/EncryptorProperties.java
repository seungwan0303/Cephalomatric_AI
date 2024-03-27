package kr.ac.wku.cephalometricai.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;

@ConfigurationProperties("encryptor")
public class EncryptorProperties {
    public String encryptPassword(String text){
        try{
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(text.getBytes());
            StringBuilder builder = new StringBuilder();
            for (byte b : md.digest()) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch(NoSuchAlgorithmException e){
            return "";
        }
    }

    private final static String ALG = "AES/CBC/PKCS5Padding";

    public String encryptAES256(String text, String uuid) throws Exception {
        String key = uuid.toString().replaceAll("-","");
        Cipher cipher = Cipher.getInstance(ALG);
        SecretKeySpec keySpec = new SecretKeySpec(key.replaceAll("-","").getBytes(), "AES");
        IvParameterSpec ivParamSpec = new IvParameterSpec(key.substring(0, 16).getBytes());
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivParamSpec);

        byte[] encrypted = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    public String decryptAES256(String text, String uuid) throws Exception{
        String key = uuid.toString().replaceAll("-","");
        Cipher cipher = Cipher.getInstance(ALG);
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(), "AES");
        IvParameterSpec ivParamSpec = new IvParameterSpec(key.substring(0, 16).getBytes());
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivParamSpec);

        byte[] decodedBytes = Base64.getDecoder().decode(text);
        byte[] decrypted = cipher.doFinal(decodedBytes);
        return new String(decrypted, StandardCharsets.UTF_8);
    }
}
