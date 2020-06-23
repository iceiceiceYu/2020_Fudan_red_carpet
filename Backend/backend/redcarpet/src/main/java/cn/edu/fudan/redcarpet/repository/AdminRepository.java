package cn.edu.fudan.redcarpet.repository;

import cn.edu.fudan.redcarpet.domain.Admin;
import org.springframework.data.repository.CrudRepository;


public interface AdminRepository extends CrudRepository<Admin, Integer> {
    Admin findTopByUsername(String username);
}
