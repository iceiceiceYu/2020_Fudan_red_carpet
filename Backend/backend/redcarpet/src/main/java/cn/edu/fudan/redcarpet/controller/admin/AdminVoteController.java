package cn.edu.fudan.redcarpet.controller.admin;

import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.domain.Vote;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.userRank.UserRankRepository;
import cn.edu.fudan.redcarpet.repository.VoteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(value = "/admin/vote")
public class AdminVoteController {

    private final VoteRepository voteRepository;
    private final NomineeRepository nomineeRepository;

    @Autowired
    public AdminVoteController(VoteRepository voteRepository, NomineeRepository nomineeRepository) {
        this.voteRepository = voteRepository;
        this.nomineeRepository = nomineeRepository;
    }

    @GetMapping
    public MyResponse voteInfo(@RequestParam Integer nomineeId) {
        log.info("Get vote info: " + nomineeId);
        List<Vote> voteList = voteRepository.findAllByNomineeId(nomineeId);
        voteList.forEach(vote -> vote.setNominee(null));
        return MyResponse.success("获取投票列表成功", voteList);
    }

    @GetMapping(value = "/delete")
    public MyResponse deleteVote(@RequestParam Long voteId) {
        log.info("Detele vote: " + voteId);
        Vote vote = voteRepository.findTopById(voteId);
        if (vote == null) return MyResponse.fail("无此投票");
        Nominee nominee = vote.getNominee();
        nominee.setVotes(nominee.getVotes() - vote.getWeight());
        voteRepository.delete(vote);
        nomineeRepository.save(nominee);
        return MyResponse.success("删除成功");
    }

}
