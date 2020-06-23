package cn.edu.fudan.redcarpet.repository;

import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.domain.Vote;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.sql.Timestamp;
import java.util.List;

public interface VoteRepository extends CrudRepository<Vote, Long> {

    Vote findTopById(Long id);

    List<Vote> findAllByNomineeId(Integer nominee_id);
    List<Vote> findAllByNomineeIdOrderByTimestampAsc(Integer nominee_id);

    List<Vote> findAllByUserAndTimestampBetween(User user, Timestamp t1, Timestamp t2);

    @Deprecated
    @Query(value = "select count(distinct user_id) from vote where timestamp between :t1 and :t2", nativeQuery = true)
    Long countDistinctUserByTimestampBetween(Timestamp t1, Timestamp t2);

    List<Vote> findAll();

    Long countAllByUser(User user);

    List<Vote> findAllByNomineeAndTimestampBetween(Nominee nominee, Timestamp t1, Timestamp t2);

    List<Vote> findAllByNomineeAndIp(Nominee nominee, String ip);

}
