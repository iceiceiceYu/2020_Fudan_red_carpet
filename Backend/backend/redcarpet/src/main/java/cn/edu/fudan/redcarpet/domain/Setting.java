package cn.edu.fudan.redcarpet.domain;

import lombok.Data;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Data
public class Setting {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private boolean _switch;

    private Timestamp endTime;
}
