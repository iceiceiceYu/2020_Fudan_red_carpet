package cn.edu.fudan.redcarpet.controller.admin;

import cn.edu.fudan.redcarpet.domain.Setting;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.SettingRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;

@Controller
@RequestMapping(path = "/admin/setting")
public class AdminSettingController {

    private final SettingRepository settingRepository;

    public AdminSettingController(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @GetMapping(path = "/switch")
    public @ResponseBody
    MyResponse getSwitch() {
        Setting setting = settingRepository.findFirstByOrderByIdAsc();
        return MyResponse.success("", setting.is_switch());
    }

    @PostMapping(path = "/switch")
    public @ResponseBody
    MyResponse setSwitch(@RequestParam boolean _switch) {
        Setting setting = settingRepository.findFirstByOrderByIdAsc();
        setting.set_switch(_switch);
        settingRepository.save(setting);
        return MyResponse.success("", null);
    }

    @GetMapping(path = "/endTime")
    public @ResponseBody
    MyResponse getEndTime() {
        Setting setting = settingRepository.findFirstByOrderByIdAsc();
        return MyResponse.success("", setting.getEndTime());
    }

    @PostMapping(path = "/endTime")
    public @ResponseBody
    MyResponse setEndTime(@RequestParam Long time) { // todo to check
        Timestamp timestamp = new Timestamp(time);
        Setting setting = settingRepository.findFirstByOrderByIdAsc();
        setting.setEndTime(timestamp);
        settingRepository.save(setting);
        return MyResponse.success("", null);
    }
}
