package cn.edu.fudan.redcarpet.userRank;

import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.domain.Vote;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.UserRepository;
import cn.edu.fudan.redcarpet.repository.VoteRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
public class UserRankController {

    private final VoteRepository voteRepository;
    private final UserRankRepository userRankRepository;
    private final UserRepository userRepository;

    public UserRankController(VoteRepository voteRepository, UserRankRepository userRankRepository, UserRepository userRepository) {
        this.voteRepository = voteRepository;
        this.userRankRepository = userRankRepository;
        this.userRepository = userRepository;
    }

    // not used currently.
    @GetMapping(value = "/admin/rank/generate")
    public MyResponse generateRank(@RequestParam int voteNumber, @RequestParam int limit) {
        userRankRepository.deleteAll();
        int rank = 0;
        Map<User, Integer> map = new HashMap<>();
        List<User> userRankList = new ArrayList<>();
        List<Vote> votes = voteRepository.findAll(); // not good and need to be ordered
        for (Vote vote : votes) {
            User u = vote.getUser();
            if (map.containsKey(u)) {
                int v = map.get(u);
                if (v < voteNumber) {
                    v++;
                    if (v == voteNumber) {
                        rank++;
                        UserRank userRank = new UserRank();
                        userRank.setUser(u);
                        userRank.setRank(rank);
                        userRankRepository.save(userRank);
                        userRankList.add(u);
                        if (rank >= limit) break;
                    }
                    map.put(u, v);
                }
            } else {
                map.put(u, 1);
            }
        }
        log.info("completed {}", userRankList.size());
        return MyResponse.success("查看成功", userRankList);
    }


    @Data
    @NoArgsConstructor
    class RankData {
        int rank;
        boolean lottery;
    }

    @GetMapping(value = "/user/rank")
    public MyResponse getRank(@RequestParam String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");
        UserRank userRank = userRankRepository.findFirstByUser(user);

        RankData rankData = new RankData();
        rankData.setLottery(user.isLottery());

        if (userRank == null) rankData.setRank(-1);
        else rankData.setRank(userRank.getRank());

        return MyResponse.success("", rankData);
    }

    @GetMapping(path = "/user/lottery")
    public MyResponse lottery(@RequestParam final String openId) {
        User user = userRepository.findTopByOpenid(openId);
        if (user == null) return MyResponse.fail("openId 无效");
        user.setLottery(true);
        userRepository.save(user);
        return MyResponse.success("");
    }

}
