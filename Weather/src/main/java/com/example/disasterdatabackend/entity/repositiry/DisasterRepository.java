package com.example.disasterdatabackend.entity.repositiry;

import com.example.disasterdatabackend.entity.DisasterData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 数据访问层：封装所有与disaster_data表的交互逻辑
 */
@Repository
public class DisasterRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;  // 注入Spring JDBC工具类


    // 根据开始年份查找灾难信息
    public List<DisasterData> findByStartYear(Integer startYear) {
        String sql = "SELECT \"DisNo.\" AS disNo, \"Historic\",\"Classification Key\", \"Classifier Group\", \"Disaster Type\", \"Country\"," +
                " \"Location\", \"Start Year\", \"Total Damage ('000 US$)\" AS totalDamage, \"Total Affected\", \"Magnitude\" " +
                "FROM disaster_data WHERE \"Start Year\" =?";
        return jdbcTemplate.query(
                sql,
                new BeanPropertyRowMapper<>(DisasterData.class),
                startYear
        );
    }

    // 根据地址（模糊匹配）查找灾难信息
    public List<DisasterData> findByLocationLike(String location) {
        // 支持模糊查询（如输入"China"可匹配"China", "South China"等）
        String sql = "SELECT \"DisNo.\" AS disNo, \"Historic\",\"Classification Key\", \"Classifier Group\", \"Disaster Type\", \"Country\"," +
                " \"Location\", \"Start Year\", \"Total Damage ('000 US$)\" AS totalDamage, \"Total Affected\", \"Magnitude\" " +
                "FROM disaster_data WHERE \"Location\" LIKE?";
        return jdbcTemplate.query(
                sql,
                new BeanPropertyRowMapper<>(DisasterData.class),
                "%" + location + "%"  // 拼接通配符实现模糊匹配
        );
    }

    // 根据灾害类型查找（模糊匹配）
    public List<DisasterData> findByDisasterType(String disasterType) {
        String sql = "SELECT \"DisNo.\" AS disNo, \"Historic\",\"Classification Key\", \"Classifier Group\", \"Disaster Type\", \"Country\"," +
                " \"Location\", \"Start Year\", \"Total Damage ('000 US$)\" AS totalDamage, \"Total Affected\", \"Magnitude\" " +
                "FROM disaster_data WHERE \"Disaster Type\" =?";
        return jdbcTemplate.query(
                sql,
                new BeanPropertyRowMapper<>(DisasterData.class),
                disasterType
        );
    }

    // 根据灾害编号（DisNo.）精确查询
    public List<DisasterData> findByDisasterNo(String disNo) {
        String sql = "SELECT \"DisNo.\" AS disNo, \"Historic\",\"Classification Key\", \"Classifier Group\", \"Disaster Type\", \"Country\"," +
                " \"Location\", \"Start Year\", \"Total Damage ('000 US$)\" AS totalDamage, \"Total Affected\", \"Magnitude\" " +
                "FROM disaster_data WHERE \"DisNo.\" =?";
        return jdbcTemplate.query(
                sql,
                new BeanPropertyRowMapper<>(DisasterData.class),
                disNo// 传递DisNo参数（精确匹配）
        );
    }

    // 获取所有灾难数据（用于全量展示）
    public List<DisasterData> findAll() {
        String sql = "SELECT \"DisNo.\" AS disNo, \"Historic\",\"Classification Key\", \"Classifier Group\", \"Disaster Type\", " +
                "\"Country\", \"Location\", \"Start Year\", \"Total Damage ('000 US$)\" AS totalDamage, \"Total Affected\", \"Magnitude\" FROM disaster_data";
        return jdbcTemplate.query(
                sql,
                new BeanPropertyRowMapper<>(DisasterData.class)
        );
    }
}