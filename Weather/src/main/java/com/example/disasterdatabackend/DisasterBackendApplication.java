package com.example.disasterdatabackend;  // 根包路径（必须是业务类的父包）

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication  // 核心注解：开启自动配置、组件扫描、配置类支持
public class DisasterBackendApplication {

    // 程序入口：启动Spring应用
    public static void main(String[] args) {
        // 启动应用：参数1为启动类的Class对象，参数2为命令行参数
        SpringApplication.run(DisasterBackendApplication.class, args);
    }
}