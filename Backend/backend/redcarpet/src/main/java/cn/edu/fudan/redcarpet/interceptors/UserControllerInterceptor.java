package cn.edu.fudan.redcarpet.interceptors;

import cn.edu.fudan.redcarpet.domain.Setting;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.SettingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;

@Component
@Slf4j
public class UserControllerInterceptor implements HandlerInterceptor {

    private final SettingRepository settingRepository;

    public UserControllerInterceptor(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Setting setting = settingRepository.findFirstByOrderByIdAsc();
        if (setting != null) {
            if (setting.getEndTime().before(new Timestamp(System.currentTimeMillis()))) {
                log.info("Access denied.");
                handleFail(response, "投票已结束 谢谢您的参与");
                return false;
            } else if (!setting.is_switch()) {
                log.info("Access denied.");
                handleFail(response, "系统未开启");
                return false;
            }
        }
        return true;
    }

    private void handleFail(HttpServletResponse response, String msg) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().print(mapper.writeValueAsString(MyResponse.fail(msg)));
        } catch (IOException ignored) {
        }
    }
}
