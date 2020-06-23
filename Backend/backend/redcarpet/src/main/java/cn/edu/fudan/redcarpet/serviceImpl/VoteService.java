package cn.edu.fudan.redcarpet.serviceImpl;

import cn.edu.fudan.redcarpet.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class VoteService {

    @Autowired
    VoteRepository voteRepository;

    private long totalVote;

    @PostConstruct
    public void init() {
        totalVote = voteRepository.count();
    }

    public long getTotal() {
        return totalVote;
    }

    public synchronized void totalAddOne() {
        totalVote = totalVote + 1;
    }
}
