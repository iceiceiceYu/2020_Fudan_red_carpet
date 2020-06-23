package cn.edu.fudan.redcarpet.repository;

import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.User;
import cn.edu.fudan.redcarpet.util.NomineeState;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface NomineeRepository extends CrudRepository<Nominee, Integer> {

    List<Nominee> findAll();

    Nominee findTopById(Integer id);

    Nominee findTopByNameAndStateIsNot(String name, NomineeState nomineeState);

    List<Nominee> findAllByState(NomineeState state);

    Long countByState(NomineeState state);

    List<Nominee> findAllByUser(User user);
}
