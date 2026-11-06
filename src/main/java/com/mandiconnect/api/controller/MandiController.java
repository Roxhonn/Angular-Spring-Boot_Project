package com.mandiconnect.api.controller;

import com.mandiconnect.api.dto.MandiDto;
import com.mandiconnect.api.model.Crop;
import com.mandiconnect.api.service.MandiService;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MandiController {
  private final MandiService mandiService;

  public MandiController(MandiService mandiService) {
    this.mandiService = mandiService;
  }

  @GetMapping("/health")
  public Map<String, Object> health() {
    return Map.of(
        "status", "UP",
        "service", "Mandi Connect Platform API",
        "timestamp", OffsetDateTime.now().toString());
  }

  @GetMapping("/mandis")
  public List<MandiDto> mandis(@RequestParam(required = false) String district) {
    return mandiService.getMandis(district);
  }

  @GetMapping("/mandis/{id}")
  public MandiDto mandi(@PathVariable Long id) {
    return mandiService.getMandi(id);
  }

  @GetMapping("/crops")
  public List<Crop> crops() {
    return mandiService.getCrops();
  }
}
