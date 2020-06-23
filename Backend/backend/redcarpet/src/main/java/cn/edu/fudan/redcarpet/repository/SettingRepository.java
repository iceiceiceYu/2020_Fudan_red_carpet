package cn.edu.fudan.redcarpet.repository;

import cn.edu.fudan.redcarpet.domain.Setting;
import org.springframework.data.repository.CrudRepository;

public interface SettingRepository extends CrudRepository<Setting, Integer> {
    Setting findFirstByOrderByIdAsc();
}
