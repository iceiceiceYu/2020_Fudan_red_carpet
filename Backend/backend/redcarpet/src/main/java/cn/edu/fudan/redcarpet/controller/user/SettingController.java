package cn.edu.fudan.redcarpet.controller.user;

import cn.edu.fudan.redcarpet.domain.Setting;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.repository.SettingRepository;
import cn.edu.fudan.redcarpet.repository.VoteRepository;
import cn.edu.fudan.redcarpet.util.NomineeState;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping
public class SettingController {

    private final NomineeRepository nomineeRepository;
    private final VoteRepository voteRepository;
    private final SettingRepository settingRepository;

    public SettingController(NomineeRepository nomineeRepository, VoteRepository voteRepository, SettingRepository settingRepository) {
        this.nomineeRepository = nomineeRepository;
        this.voteRepository = voteRepository;
        this.settingRepository = settingRepository;
    }

    @GetMapping(path = "/statistics")
    public @ResponseBody
    MyResponse getStatistics() {
        Map<String, String> retData = new HashMap<>();
        retData.put("nomineeNumbers", nomineeRepository.countByState(NomineeState.PASSED).toString());
        retData.put("voteNumber", voteRepository.count() + "");
        Setting setting = settingRepository.findFirstByOrderByIdAsc();
        retData.put("endTime", setting.getEndTime().toString());
        return MyResponse.success("", retData);
    }
}
