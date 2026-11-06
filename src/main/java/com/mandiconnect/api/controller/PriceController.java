package com.mandiconnect.api.controller;

import com.mandiconnect.api.dto.LatestPriceDto;
import com.mandiconnect.api.dto.PricePointDto;
import com.mandiconnect.api.dto.PriceRequest;
import com.mandiconnect.api.service.PriceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prices")
public class PriceController {
  private final PriceService priceService;

  public PriceController(PriceService priceService) {
    this.priceService = priceService;
  }

  // GET /api/prices/latest?cropId=1&district=Bargarh  (district is optional)
  @GetMapping("/latest")
  public List<LatestPriceDto> latest(@RequestParam Long cropId,
                                     @RequestParam(required = false) String district) {
    return priceService.getLatestPrices(cropId, district);
  }

  // GET /api/prices/history?mandiId=1&cropId=1&days=30
  @GetMapping("/history")
  public List<PricePointDto> history(@RequestParam Long mandiId,
                                     @RequestParam Long cropId,
                                     @RequestParam(defaultValue = "30") int days) {
    return priceService.getHistory(mandiId, cropId, Math.max(1, Math.min(days, 60)));
  }

  // POST /api/prices  (mandi officer enters the price of a crop for his or her mandi)
  @PostMapping
  @PreAuthorize("hasRole('OFFICER')")
  @ResponseStatus(HttpStatus.CREATED)
  public LatestPriceDto save(@Valid @RequestBody PriceRequest request) {
    return priceService.savePrice(request);
  }
}
