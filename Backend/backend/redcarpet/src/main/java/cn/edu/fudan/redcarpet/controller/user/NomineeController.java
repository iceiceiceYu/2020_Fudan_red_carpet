package cn.edu.fudan.redcarpet.controller.user;

import cn.edu.fudan.redcarpet.config.AppProperties;
import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.repository.UserRepository;
import cn.edu.fudan.redcarpet.util.NomineeState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping(path = "/nominee")
public class NomineeController {
    private static final Logger log = LoggerFactory.getLogger(NomineeController.class);

    private final NomineeRepository nomineeRepository;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Autowired
    public NomineeController(NomineeRepository nomineeRepository, UserRepository userRepository, AppProperties appProperties) {
        this.nomineeRepository = nomineeRepository;
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    @PostMapping(path = "/nominate")
    public MyResponse Nominate(@RequestBody Nominee nominee, @RequestParam String openId) {
        log.info("A nominating request is invoked.");
        log.info(nominee.toString());
        log.info(openId);
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("该微信账号未认证");
        if (nominee.getName().length() > appProperties.getMaxNameSize())
            return MyResponse.fail("提名姓名字数不能大于" + appProperties.getMaxNameSize());
        if (nomineeRepository.findTopByNameAndStateIsNot(nominee.getName(), NomineeState.REJECTED) != null)
            return MyResponse.fail("该姓名已被使用");
        if (nominee.getIntroduction().length() > appProperties.getMaxIntroductionSize())
            return MyResponse.fail("提名标签字数不能大于" + appProperties.getMaxIntroductionSize());
        if (nominee.getStory().length() > appProperties.getMaxStorySize())
            return MyResponse.fail("复旦故事字数不能大于" + appProperties.getMaxStorySize());

        nominee.setUser(user);
        nominee.setNominatingTime(new Timestamp(System.currentTimeMillis()));
        nominee.setState(NomineeState.PENDING);
        nomineeRepository.save(nominee);

        log.info("A new nominee is nominated: " + nominee.toString());

        return MyResponse.success("提名成功", nominee.getId());
    }

    @GetMapping(path = "/all")
    public MyResponse getAll() {
        List<Nominee> nominees = nomineeRepository.findAllByState(NomineeState.PASSED);

        nominees.forEach(nominee -> {
            nominee.setNominatorPhone(null);
            nominee.setNominatorName(null);
            nominee.setUser(null);
            nominee.setStory(null);
        });

        return MyResponse.success("", nominees);
    }

    @GetMapping(path = "/detail")
    public MyResponse getDetail(@RequestParam int id) {
        Nominee nominee = nomineeRepository.findTopById(id);
        if (nominee == null || nominee.getState() != NomineeState.PASSED)
            return MyResponse.fail("无该候选人或该候选人尚未审核通过");

        nominee.setNominatorPhone(null);
        nominee.setNominatorName(null);
        nominee.setUser(null);

        return MyResponse.success("", nominee);
    }

}
