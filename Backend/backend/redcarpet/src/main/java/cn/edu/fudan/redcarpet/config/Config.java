package cn.edu.fudan.redcarpet.config;

import cn.edu.fudan.redcarpet.interceptors.AdminInterceptor;
import cn.edu.fudan.redcarpet.interceptors.UserControllerInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class Config implements WebMvcConfigurer {
    private final AdminInterceptor adminInterceptor;

    private final
    UserControllerInterceptor userControllerInterceptor;

    public Config(UserControllerInterceptor userControllerInterceptor, AdminInterceptor adminInterceptor) {
        this.userControllerInterceptor = userControllerInterceptor;
        this.adminInterceptor = adminInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userControllerInterceptor)
                .addPathPatterns("/user/vote")
                .addPathPatterns("/nominee/nominate");
        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/login");
    }


    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("content-type")
                .allowCredentials(true)
                .maxAge(-1);
    }
}