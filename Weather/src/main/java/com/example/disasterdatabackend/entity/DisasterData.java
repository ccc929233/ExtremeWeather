package com.example.disasterdatabackend.entity;

import lombok.Data;

/**
 * 实体类：映射disaster_data表（完全对应提供的表结构）
 */
@Data
public class DisasterData {

    // 灾害编号（TEXT）
    private String disNo;

    // 历史标识（TEXT）
    private String historic;

    // 分类键（TEXT）
    private String classificationKey;

    // 分类组（TEXT）
    private String classifierGroup;

    // 灾害分组（TEXT）
    private String disasterSubgroup;

    // 灾害类型（TEXT）
    private String disasterType;

    // 灾害子类型（TEXT）
    private String disasterSubtype;

    // 外部ID（TEXT）
    private String externalIds;

    // 事件名称（TEXT）
    private String eventName;

    // ISO编码（TEXT）
    private String iso;

    // 国家（TEXT）
    private String country;

    // 次区域（TEXT）
    private String subregion;

    // 区域（TEXT）
    private String region;

    // 地点（TEXT）
    private String location;

    // 起源（TEXT）
    private String origin;

    // 关联类型（TEXT）
    private String associatedTypes;

    // OFDA/BHA响应（TEXT）
    private String ofdaBhaResponse;

    // 呼吁（TEXT）
    private String appeal;

    // 援助贡献（千美元，TEXT）
    private String aidContribution;

    // 震级（TEXT）
    private String magnitude;

    // 震级单位（TEXT）
    private String magnitudeScale;

    // 纬度（TEXT）
    private String latitude;

    // 经度（TEXT）
    private String longitude;

    // 河流流域（TEXT）
    private String riverBasin;

    // 开始年份（INTEGER）
    private Integer startYear;

    // 开始月份（INTEGER）
    private Integer startMonth;

    // 开始日期（INTEGER）
    private Integer startDay;

    // 结束年份（INTEGER）
    private Integer endYear;

    // 结束月份（INTEGER）
    private Integer endMonth;

    // 结束日期（TEXT）
    private String endDay;

    // 总死亡人数（TEXT）
    private String totalDeaths;

    // 受伤人数（TEXT）
    private String noInjured;

    // 无家可归人数（TEXT）
    private String noHomeless;

    // 受影响总人数（TEXT）
    private String totalAffected;

    // 重建成本（千美元，TEXT）
    private String reconstructionCosts;

    // 调整后的重建成本（千美元，TEXT）
    private String reconstructionCostsAdjusted;

    // 保险损失（千美元，TEXT）
    private String insuredDamage;

    // 调整后的保险损失（千美元，TEXT）
    private String insuredDamageAdjusted;

    // 总损失（千美元，TEXT）
    private String totalDamage;

    // 调整后的总损失（千美元，TEXT）
    private String totalDamageAdjusted;

    // 消费者价格指数（REAL）
    private Double cpi;

    // 行政单位（TEXT）
    private String adminUnits;

    // 录入日期（TEXT）
    private String entryDate;

    // 最后更新日期（TEXT）
    private String lastUpdate;
}