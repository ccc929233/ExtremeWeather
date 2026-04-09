package com.example.disasterdatabackend.controller;

import com.example.disasterdatabackend.entity.DisasterData;
import com.example.disasterdatabackend.service.DisasterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 控制器：提供灾难数据查询接口，对接前端请求
 */
@RestController
@RequestMapping("/api/disasters")  // 接口统一前缀，便于前端归类调用
@CrossOrigin(origins = "*")  // 允许跨域（前端不同域名可调用）
public class DisasterController {

    // 注入服务层（构造方法注入，Spring自动管理）
    private final DisasterService disasterService;

    public DisasterController(DisasterService disasterService) {
        this.disasterService = disasterService;
    }

    @GetMapping
    public ResponseEntity<List<DisasterData>> getAllDisasters() {
        List<DisasterData> data = disasterService.getAllDisasters();
        // 无论是否有数据，均返回200 OK（空数据返回空列表）
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @GetMapping("/by-year")
    public ResponseEntity<List<DisasterData>> getByStartYear(
            @RequestParam Integer year  // 接收前端传递的年份参数
    ) {
        List<DisasterData> data = disasterService.getByStartYear(year);
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @GetMapping("/by-location")
    public ResponseEntity<List<DisasterData>> getByLocationLike(
            @RequestParam String location  // 接收地址参数（支持部分匹配）
    ) {
        List<DisasterData> data = disasterService.getByLocationLike(location);
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @GetMapping("/by-type")
    public ResponseEntity<List<DisasterData>> getByDisasterType(
            @RequestParam String type  // 灾害类型（如"洪水"、"地震"）
    ) {
        List<DisasterData> data = disasterService.getByDisasterType(type);
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @GetMapping("/by-disno")
    public ResponseEntity<List<DisasterData>> getByDisasterNo(
            @RequestParam String disNo  // 接收前端传递的DisNo参数（参数名disNo，与前端对齐）
    ) {
        List<DisasterData> data = disasterService.getByDisasterNo(disNo);
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        // 返回错误信息（JSON格式：{"error": "错误描述"}）
        return new ResponseEntity<>(
                Map.of("error", e.getMessage()),  // 错误信息
                HttpStatus.BAD_REQUEST  // 状态码400
        );
    }
}