package cn.edu.fudan.redcarpet.userRank;

import cn.edu.fudan.redcarpet.domain.User;
import lombok.Data;

import javax.persistence.*;

@Entity
@Data
public class UserRank {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_rank_generator")
    @SequenceGenerator(name = "user_rank_generator", sequenceName = "user_rank_seq", allocationSize = 1)
    private Integer id;

    @OneToOne(targetEntity = User.class)
    private User user;

    private int rank;
}
