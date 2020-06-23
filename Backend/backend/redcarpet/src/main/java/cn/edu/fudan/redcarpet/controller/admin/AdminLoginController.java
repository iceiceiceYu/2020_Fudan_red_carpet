package cn.edu.fudan.redcarpet.controller.admin;

import cn.edu.fudan.redcarpet.domain.Admin;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.AdminRepository;
import cn.edu.fudan.redcarpet.util.IpUtils;
import cn.edu.fudan.redcarpet.util.JWTUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@RestController
@RequestMapping(value = "/admin")
public class AdminLoginController {

    private final AdminRepository adminRepository;

    @Autowired
    public AdminLoginController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @PostMapping(path = "/login")
    public MyResponse login(@RequestParam String username, @RequestParam String password, HttpServletResponse response, HttpServletRequest request) {
        String ipAddress = IpUtils.getIpAddr(request);
        log.info("login {} {} ip:{}", username, password, ipAddress);
        Admin admin = adminRepository.findTopByUsername(username);

        // 判断是否为内网访问
        if (!IpUtils.internalIp(ipAddress))
            return MyResponse.fail("内网限制");

        if (admin != null && admin.getPassword().equals(password)) {
            Cookie cookie = new Cookie("Red-Carpet-Token", JWTUtils.createToken());
            cookie.setMaxAge(5 * 60); // 5 minutes
            cookie.setPath("/");
            response.addCookie(cookie);
            return MyResponse.success("登陆成功", null);
        } else {
            return MyResponse.fail("登陆失败");
        }
    }

    @GetMapping(path = "/logout")
    public MyResponse logout(HttpServletResponse response) {
        log.info("Logout");
        Cookie cookie = new Cookie("Red-Carpet-Token", "deleted");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return MyResponse.success("登出成功");
    }

    @GetMapping(path = "/checkToken")
    public MyResponse checkToken() {
        return MyResponse.success("登陆成功");
    }
}
