package cn.edu.fudan.redcarpet.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Date;

public class JWTUtils {
    private static final Logger log = LoggerFactory.getLogger(JWTUtils.class);

    private static final String TOKEN_SECRET = "carpet_secret525$#%870@#^";
    private static final String ISSUER = "carpet_auth0";
    private static Algorithm JWTAlgorithm = null;
    private static JWTVerifier verifier = null;

    private static Algorithm getJWTAlgorithm() {
        if (JWTAlgorithm == null)
            try {
                JWTAlgorithm = Algorithm.HMAC256(TOKEN_SECRET);
            } catch (IOException e) {
                e.printStackTrace();
            }
        return JWTAlgorithm;
    }

    private static JWTVerifier getVerifier() {
        if (verifier == null) {
            verifier = JWT.require(getJWTAlgorithm())
                    .withIssuer(ISSUER)
                    .build();
        }
        return verifier;
    }

    public static String createToken() {
        String token = null;
        try {
            Date expiresAt = new Date(System.currentTimeMillis() + 10L * 60L * 1000L);
            Date issueAt = new Date(System.currentTimeMillis());
            token = JWT.create()
                    .withIssuer(ISSUER)
                    .withExpiresAt(expiresAt)
                    .withNotBefore(issueAt)
                    .withIssuedAt(issueAt)
                    .sign(getJWTAlgorithm());
        } catch (JWTCreationException | IllegalArgumentException e) {
            e.printStackTrace();
        }
        return token;
    }

    public static DecodedJWT deToken(final String token) {
        try {
            return getVerifier().verify(token);
        } catch (Exception exception) {
            //Invalid signature/claims
//            exception.printStackTrace();
            log.warn("Token is illegal. Access denied");
            return null;
        }
    }

    public static String refreshToken(final String oldToken) {
        DecodedJWT decodedJWT = deToken(oldToken);
        if (decodedJWT == null) return null;
        if (decodedJWT.getExpiresAt().getTime() - System.currentTimeMillis() < 2L * 60L * 1000L) // 2 minutes
            return createToken();
        return oldToken;
    }
}
