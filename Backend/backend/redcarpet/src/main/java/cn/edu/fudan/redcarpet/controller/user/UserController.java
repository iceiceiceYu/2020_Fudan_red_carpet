package cn.edu.fudan.redcarpet.controller.user;


import cn.edu.fudan.redcarpet.config.AppProperties;
import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.domain.Vote;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.repository.UserRepository;
import cn.edu.fudan.redcarpet.repository.VoteRepository;
import cn.edu.fudan.redcarpet.service.WXOpenService;
import cn.edu.fudan.redcarpet.util.IpUtils;
import cn.edu.fudan.redcarpet.util.NomineeState;
import cn.edu.fudan.redcarpet.util.TimeUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@Slf4j
@RequestMapping(path = "/user")
public class UserController {

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final NomineeRepository nomineeRepository;
    private final WXOpenService wxOpenService;

    @Autowired
    public UserController(UserRepository userRepository, VoteRepository voteRepository, NomineeRepository nomineeRepository, AppProperties appProperties, WXOpenService wxOpenService) {
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
        this.nomineeRepository = nomineeRepository;
        this.appProperties = appProperties;
        this.wxOpenService = wxOpenService;
    }

    @GetMapping(path = "/test")
    public MyResponse test() {
        return MyResponse.success("Connect successfully.");
    }

    @GetMapping(path = "/login")
    public MyResponse login(@RequestParam final String code) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            final String baseUrl = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appProperties.getAppId() + "&secret=" + appProperties.getAppSecret() + "&js_code=" + code + "&grant_type=authorization_code";
            URI uri = new URI(baseUrl);

            ResponseEntity<String> responseEntity = restTemplate.getForEntity(uri, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseEntity.getBody());

            if (root.path("errcode").asInt() == 0) {
                // get openid successfully.
                String openid = root.path("openid").asText();
                User user = userRepository.findTopByOpenid(openid);
                if (user == null) {
                    user = new User();
                    user.setOpenid(openid);
                    userRepository.save(user);
                    log.info("Add a new user: " + user);
                }
                return MyResponse.success("登陆成功", responseEntity.getBody());
            } else {
                // get openid failed
                return MyResponse.fail("登陆失败", root.path("errmsg").asText());
            }
        } catch (Exception e) {
            return MyResponse.fail("登陆失败", e);
        }

    }


    @GetMapping(path = "/loginBetter")
    public MyResponse login2(@RequestParam final String code) {
        String openid = wxOpenService.getOpenId(code);
        User user = userRepository.findTopByOpenid(openid);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            userRepository.save(user);
            log.info("Add a new user: " + user);
        }
        return MyResponse.success("登陆成功", openid);
    }


    @GetMapping(path = "/notification")
    public MyResponse getNotification(@RequestParam final String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");
        return MyResponse.success("", user.getNotification());
    }

    @GetMapping(path = "/clearNotification")
    public MyResponse clearNotification(@RequestParam final String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");
        user.setNotification(0);
        userRepository.save(user);
        return MyResponse.success("成功清空Notification");
    }

    @GetMapping(path = "/voted")
    public MyResponse getVoted(@RequestParam final String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");

        List<Vote> votes = voteRepository.findAllByUserAndTimestampBetween(user, TimeUtils.today(), TimeUtils.tomorrow());
        List<Integer> nomineeIdList = votes.stream().map(vote -> vote.getNominee().getId()).collect(Collectors.toList());

        return MyResponse.success("", nomineeIdList);
    }

    @GetMapping(path = "/totalVoted")
    public MyResponse getTotalVoted(@RequestParam final String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");
        return MyResponse.success("", voteRepository.countAllByUser(user));
    }

    @GetMapping(path = "/nomination")
    public MyResponse getNomination(@RequestParam final String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");

        List<Nominee> nominees = nomineeRepository.findAllByUser(user);

        return MyResponse.success("", nominees);
    }

    private Map<Integer, byte[]> lockMap = new HashMap<>();

    /**
     * 投票 API
     *
     * @param openId    投票发起人openId
     * @param nomineeId 候选人Id
     * @param request   用来获取投票IP，根据内外网决定投票权重
     * @return 若成功，返回投票后候选人票数；否则返回相应失败信息
     */
    @PostMapping(path = "/vote")
    public MyResponse vote(@RequestParam final String openId, @RequestBody int nomineeId, HttpServletRequest request) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");

        List<Vote> votes = voteRepository.findAllByUserAndTimestampBetween(user, TimeUtils.today(), TimeUtils.tomorrow());
        List<Nominee> nomineeList = votes.stream().map(Vote::getNominee).collect(Collectors.toList());
        if (nomineeList.size() >= appProperties.getMaxVotePerDay())
            return MyResponse.fail("每天最多投" + appProperties.getMaxVotePerDay() + "票");

        if (!lockMap.containsKey(nomineeId)) lockMap.put(nomineeId, new byte[0]);
        synchronized (lockMap.get(nomineeId)) {
            Nominee nominee = nomineeRepository.findTopById(nomineeId);
            if (nominee == null) return MyResponse.fail("nomineeId 无效");
            if (nominee.getState() != NomineeState.PASSED) return MyResponse.fail("该候选人尚未审核或审核未通过");
            if (nomineeList.contains(nominee)) return MyResponse.fail("重复票");

            // 1. 判断是否为内网访问
            String ipAddress = IpUtils.getIpAddr(request);
            int weight = IpUtils.internalIp(ipAddress) ? appProperties.getInnerWeight() : appProperties.getOutsideWeight();

            // 2. 保存vote信息;
            Vote vote = new Vote();
            vote.setIp(ipAddress);
            vote.setNominee(nominee);
            vote.setTimestamp(new Timestamp(System.currentTimeMillis()));
            vote.setUser(user);
            vote.setWeight(weight);
            voteRepository.save(vote);

            // 3. 更新nominee.votes;
            nominee.setVotes(nominee.getVotes() + weight);
            nomineeRepository.save(nominee);

            log.info("New vote: {}", vote);
            return MyResponse.success("投票成功", nominee.getVotes());
        }
    }

}
