package cn.edu.fudan.redcarpet.domain;


import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.Size;

@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_generator")
//    @SequenceGenerator(name = "user_generator", sequenceName = "user_seq", allocationSize = 1)
    private Long id;

    @Size(max = 128)
    @Column(unique = true)
    private String openid; // WeChat Openid

    private int notification = 0;

    private boolean lottery = false;
}
