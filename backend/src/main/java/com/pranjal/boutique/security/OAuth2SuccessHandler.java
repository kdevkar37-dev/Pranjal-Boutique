package com.pranjal.boutique.security;

import com.pranjal.boutique.dto.AuthResponse;
import com.pranjal.boutique.service.AuthService;
import com.pranjal.boutique.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.oauth2.redirect-url}")
    private String oauth2RedirectUrl;

    @Value("${app.security.refresh-cookie-name:boutique_refresh}")
    private String refreshCookieName;

    @Value("${app.security.refresh-cookie-secure:true}")
    private boolean refreshCookieSecure;

    @Value("${app.security.refresh-cookie-same-site:Strict}")
    private String refreshCookieSameSite;

    public OAuth2SuccessHandler(AuthService authService, RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        AuthResponse authResponse = authService.processOAuth2User(oAuth2User.getAttributes());

        ResponseCookie refreshCookie = ResponseCookie
                .from(refreshCookieName, refreshTokenService.createToken(authResponse.email()))
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path("/api/auth")
                .maxAge(refreshTokenService.getRefreshExpirationSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        String redirect = oauth2RedirectUrl + "?token=" + authResponse.token();
        response.sendRedirect(redirect);
    }
}
