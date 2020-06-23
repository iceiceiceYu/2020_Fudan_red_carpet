package cn.edu.fudan.redcarpet.interceptors;

import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.util.IpUtils;
import cn.edu.fudan.redcarpet.util.JWTUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@Component
public class AdminInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(AdminInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String ipAddress = IpUtils.getIpAddr(request);
        log.info("Admin request {}", ipAddress);
        if (request.getMethod().equalsIgnoreCase("OPTIONS"))
            return true;

        // 判断是否为内网访问
        if (!IpUtils.internalIp(ipAddress)) {
            handleFail(response, MyResponse.fail("内网限制"));
            return false;
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                log.info(cookie.getName() + ": " + cookie.getValue());
                if (cookie.getName().equals("Red-Carpet-Token")) {
                    String oldToken = cookie.getValue();
                    String newToken = JWTUtils.refreshToken(oldToken);
                    if (newToken == null) break;
                    cookie.setValue(newToken);
                    cookie.setMaxAge(5 * 60); // 5 minutes
                    cookie.setPath("/");
                    response.addCookie(cookie);
                    return true;
                }
            }
        }

        // token失效
        handleFail(response, MyResponse.tokenError());
        return false;
    }

    private void handleFail(HttpServletResponse response, MyResponse myResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter printWriter = response.getWriter();
            printWriter.print(mapper.writeValueAsString(myResponse));
            printWriter.flush();
        } catch (IOException ignored) {
        }
    }
}
