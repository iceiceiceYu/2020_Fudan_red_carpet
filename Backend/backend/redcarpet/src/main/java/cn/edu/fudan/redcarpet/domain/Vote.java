package cn.edu.fudan.redcarpet.domain;

import lombok.Data;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Data
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vote_generator")
//    @SequenceGenerator(name = "vote_generator", sequenceName = "vote_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(targetEntity = User.class)
    private User user;

    private String ip;

    @ManyToOne(targetEntity = Nominee.class)
    private Nominee nominee;

    private Timestamp timestamp;

    private int weight;

    private boolean valid = true;
}
