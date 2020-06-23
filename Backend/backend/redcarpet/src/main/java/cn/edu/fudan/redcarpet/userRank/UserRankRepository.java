package cn.edu.fudan.redcarpet.userRank;

import cn.edu.fudan.redcarpet.domain.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRankRepository extends CrudRepository<UserRank, Integer> {

    UserRank findFirstByUser(User user);

}
