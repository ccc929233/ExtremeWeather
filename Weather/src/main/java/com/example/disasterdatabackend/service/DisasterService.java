package com.example.disasterdatabackend.service;

import com.example.disasterdatabackend.entity.DisasterData;
import com.example.disasterdatabackend.entity.repositiry.DisasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 服务层：对接Repository的所有查询，处理业务逻辑
 */
@Service
public class DisasterService {

    // 注入数据访问层（通过构造方法，Spring自动管理）
    private final DisasterRepository disasterRepository;

    public DisasterService(DisasterRepository disasterRepository) {
        this.disasterRepository = disasterRepository;
    }


    // 查询所有灾难数据
    public List<DisasterData> getAllDisasters() {
        // 调用Repository获取全量数据
        List<DisasterData> allData = disasterRepository.findAll();
        // 确保返回非null（空数据返回空列表，避免前端处理null）
        return allData!= null? allData : List.of();
    }
    // 按灾害编号（DisNo.）查询
    public List<DisasterData> getByDisasterNo(String disNo) {
        // 业务逻辑：参数校验（DisNo.不能为空或纯空格）
        if (!StringUtils.hasText(disNo)) {
            throw new IllegalArgumentException("灾害编号（DisNo.）不能为空或仅含空格");
        }
        // 调用Repository查询（返回匹配的结果列表，通常DisNo.唯一，列表仅1条数据）
        List<DisasterData> disasters = disasterRepository.findByDisasterNo(disNo);
        // 确保返回非null（空结果返回空列表）
        return disasters != null ? disasters : List.of();
    }

    // 按开始年份查询
    public List<DisasterData> getByStartYear(Integer startYear) {
        // 业务逻辑1：参数校验（年份必须为有效正数）
        if (startYear == null || startYear < 2000 || startYear > 2025) { // 假设当前最大年份为2025
            throw new IllegalArgumentException("无效的开始年份：必须是2000-2025之间的整数");
        }
        // 调用Repository查询
        List<DisasterData> disasters = disasterRepository.findByStartYear(startYear);
        // 业务逻辑2：过滤掉年份字段为空的异常数据
        if (disasters!= null) {
            disasters = disasters.stream()
                    .filter(d -> d.getStartYear()!= null) // 排除startYear为null的记录
                    .collect(Collectors.toList());
        }
        return disasters!= null? disasters : List.of();
    }


    // 按地址模糊查询
    public List<DisasterData> getByLocationLike(String location) {
        // 业务逻辑1：参数校验（地址不能为null或纯空格）
        if (!StringUtils.hasText(location)) {
            throw new IllegalArgumentException("地址不能为空或仅含空格");
        }
        // 调用Repository模糊查询（自动拼接%通配符）
        List<DisasterData> disasters = disasterRepository.findByLocationLike(location);
        // 业务逻辑2：过滤掉地址为空的记录，且统一地址格式（去空格）
        if (disasters!= null) {
            disasters = disasters.stream()
                    .filter(d -> StringUtils.hasText(d.getLocation())) // 排除空地址
                    .map(d -> {
                        // 地址去前后空格
                        d.setLocation(d.getLocation().trim());
                        return d;
                    })
                    .collect(Collectors.toList());
        }
        return disasters!= null? disasters : List.of();
    }


    // 按灾害类型查询（精确匹配）
    public List<DisasterData> getByDisasterType(String disasterType) {
        // 参数校验：类型不能为null或空
        if (!StringUtils.hasText(disasterType)) {
            throw new IllegalArgumentException("灾害类型不能为空");
        }
        // 调用Repository查询
        List<DisasterData> disasters = disasterRepository.findByDisasterType(disasterType);
        // 过滤掉类型字段为空的记录
        if (disasters!= null) {
            disasters = disasters.stream()
                    .filter(d -> StringUtils.hasText(d.getDisasterType()))
                    .collect(Collectors.toList());
        }
        return disasters!= null? disasters : List.of();
    }


}