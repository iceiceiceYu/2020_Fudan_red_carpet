package cn.edu.fudan.redcarpet;

import cn.edu.fudan.redcarpet.domain.Setting;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.repository.SettingRepository;
import cn.edu.fudan.redcarpet.repository.UserRepository;
import cn.edu.fudan.redcarpet.service.StorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

import java.sql.Timestamp;

@SpringBootApplication
@EnableCaching
public class RedCarpetApplication {
    public static void main(String[] args) {
        SpringApplication.run(RedCarpetApplication.class, args);
    }

    @Bean
        // init
    CommandLineRunner init(StorageService storageService, SettingRepository settingRepository) {
        return (args) -> {
            if (settingRepository.findFirstByOrderByIdAsc() == null) {
                Setting initSetting = new Setting();
                initSetting.set_switch(false);
                initSetting.setEndTime(new Timestamp(System.currentTimeMillis()));
                settingRepository.save(initSetting);
            }
            storageService.init();
        };
    }

    @Deprecated
    void test(UserRepository userRepository) {
        if (userRepository.findTopByOpenid("test") == null) {
            User user = new User();
            user.setOpenid("test");
            user.setNotification(0);
            userRepository.save(user);
        }
    }
}
