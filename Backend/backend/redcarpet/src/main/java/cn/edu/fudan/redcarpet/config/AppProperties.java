package cn.edu.fudan.redcarpet.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:app.properties")
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private int maxVotePerDay;
    private int innerWeight;
    private int outsideWeight;

    private int maxIntroductionSize;
    private int maxNameSize;
    private int maxStorySize;

    private int maxImageSize;

    private String appId;
    private String appSecret;
}
