package cn.edu.fudan.redcarpet.repository;

import cn.edu.fudan.redcarpet.domain.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Long> {

    User findTopByOpenid(String openid);
}
