package cn.edu.fudan.redcarpet.domain;

import cn.edu.fudan.redcarpet.util.NomineeState;
import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.sql.Timestamp;

@Entity
@Data
public class Nominee {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nominee_generator")
    @SequenceGenerator(name = "nominee_generator", sequenceName = "nominee_seq", allocationSize = 1)
    private Integer id;

    private String name;

    private String introduction;

    private String story;

    private String nominatorName;

    private String nominatorPhone;

    private String photoUrl1;

    private String photoUrl2;

    @ManyToOne(targetEntity = User.class)
    private User user;

    private Timestamp nominatingTime;

    private Timestamp reviewedTime;

    private NomineeState state = NomineeState.PENDING;

    private int votes = 0;
}
