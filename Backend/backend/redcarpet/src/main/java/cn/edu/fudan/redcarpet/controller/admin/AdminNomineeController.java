package cn.edu.fudan.redcarpet.controller.admin;

import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.repository.UserRepository;
import cn.edu.fudan.redcarpet.util.NomineeState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;

@Controller
@RequestMapping(path = "/admin/nominee")
public class AdminNomineeController {

    private final NomineeRepository nomineeRepository;

    private final UserRepository userRepository;

    @Autowired
    public AdminNomineeController(NomineeRepository nomineeRepository, UserRepository userRepository) {
        this.nomineeRepository = nomineeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public @ResponseBody
    MyResponse getNominee() {
        List<Nominee> nominees = nomineeRepository.findAll();
        return MyResponse.success("获取候选人信息成功", nominees);
    }


    @PostMapping(path = "/review")
    public @ResponseBody
    MyResponse reviewNominee(@RequestParam Integer id, @RequestParam NomineeState nomineeState) {
        Nominee nominee = nomineeRepository.findTopById(id);
        if (nominee != null && nominee.getState() == NomineeState.PENDING) {
            nominee.setState(nomineeState);
            nominee.setReviewedTime(new Timestamp(System.currentTimeMillis()));

            User user = nominee.getUser();
            user.setNotification(user.getNotification() + 1);

            nomineeRepository.save(nominee);
            userRepository.save(user);
            return MyResponse.success("审核成功");
        } else
            return MyResponse.fail("审核失败，该候选人不存在或已被审核。");
    }

    @PostMapping(path = "/update")
    public @ResponseBody
    MyResponse updateNominee(@RequestBody Nominee nominee) {
        if (nomineeRepository.findTopById(nominee.getId()) == null)
            return MyResponse.fail("该候选人不存在");
        nomineeRepository.save(nominee);
        return MyResponse.success("更新成功");
    }
}