package com.mandiconnect.api.config;

import com.mandiconnect.api.model.Crop;
import com.mandiconnect.api.model.Farmer;
import com.mandiconnect.api.model.Mandi;
import com.mandiconnect.api.model.MandiPrice;
import com.mandiconnect.api.model.User;
import com.mandiconnect.api.repository.CropRepository;
import com.mandiconnect.api.repository.FarmerRepository;
import com.mandiconnect.api.repository.MandiPriceRepository;
import com.mandiconnect.api.repository.UserRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.mandiconnect.api.repository.MandiRepository;
import org.springframework.stereotype.Component;

/**
 * Loads the sample Odisha data from src/main/resources/data/*.csv
 * when the database is empty. The same price.csv format can later be replaced
 * with a real file downloaded from Agmarknet.
 */
@Component
public class DataSeeder implements CommandLineRunner {
  private final MandiRepository mandiRepository;
  private final CropRepository cropRepository;
  private final MandiPriceRepository priceRepository;
  private final FarmerRepository farmerRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public DataSeeder(MandiRepository mandiRepository, CropRepository cropRepository,
                    MandiPriceRepository priceRepository, FarmerRepository farmerRepository,
                    UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.mandiRepository = mandiRepository;
    this.cropRepository = cropRepository;
    this.priceRepository = priceRepository;
    this.farmerRepository = farmerRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(String... args) throws IOException {
    if (mandiRepository.count() == 0) {
      for (String[] c : readCsv("data/mandis.csv")) {
        mandiRepository.save(new Mandi(c[0], c[1], Integer.parseInt(c[2]), c[3]));
      }
    }
    if (cropRepository.count() == 0) {
      for (String[] c : readCsv("data/crops.csv")) {
        cropRepository.save(new Crop(c[0], c[1]));
      }
    }
    if (farmerRepository.count() == 0) {
      for (String[] c : readCsv("data/farmers.csv")) {
        farmerRepository.save(new Farmer(c[0], c[1], c[2], c[3]));
      }
    }
    if (priceRepository.count() == 0) {
      Map<String, Mandi> mandis = new HashMap<>();
      for (Mandi m : mandiRepository.findAll()) {
        mandis.put(m.getName(), m);
      }
      Map<String, Crop> crops = new HashMap<>();
      for (Crop c : cropRepository.findAll()) {
        crops.put(c.getName(), c);
      }
      List<MandiPrice> prices = new ArrayList<>();
      for (String[] c : readCsv("data/prices.csv")) {
        prices.add(new MandiPrice(mandis.get(c[0]), crops.get(c[1]), LocalDate.parse(c[2]),
            Double.parseDouble(c[3]), Double.parseDouble(c[4]), Double.parseDouble(c[5])));
      }
      priceRepository.saveAll(prices);
    }
    if (userRepository.count() == 0) {
      seedDemoUsers();
    }
  }

  /**
   * Demo login accounts (passwords are saved as BCrypt hashes):
   *   admin / Admin@123
   *   bargarh.officer, jeypore.officer, bhubaneswar.officer / Officer@123
   *   every sample farmer: mobile number / Farmer@123
   */
  private void seedDemoUsers() {
    addUser("Admin", "admin", "Admin@123", "ADMIN", null, null);

    Map<String, String> officers = new LinkedHashMap<>();
    officers.put("Bargarh Mandi", "bargarh.officer");
    officers.put("Jeypore Mandi", "jeypore.officer");
    officers.put("Bhubaneswar Mandi", "bhubaneswar.officer");
    for (Mandi mandi : mandiRepository.findAll()) {
      String username = officers.get(mandi.getName());
      if (username != null) {
        addUser(mandi.getName() + " Officer", username, "Officer@123", "OFFICER", mandi, null);
      }
    }

    for (Farmer farmer : farmerRepository.findAll()) {
      addUser(farmer.getName(), farmer.getMobile(), "Farmer@123", "FARMER", null, farmer);
    }
  }

  private void addUser(String name, String username, String password, String role,
                       Mandi mandi, Farmer farmer) {
    User user = new User();
    user.setName(name);
    user.setUsername(username);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setRole(role);
    user.setMandi(mandi);
    user.setFarmer(farmer);
    userRepository.save(user);
  }

  /** Reads a CSV file from the classpath and skips the header line. */
  private List<String[]> readCsv(String path) throws IOException {
    List<String[]> rows = new ArrayList<>();
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(
        new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8))) {
      reader.readLine(); // header
      String line;
      while ((line = reader.readLine()) != null) {
        if (!line.isBlank()) {
          rows.add(line.trim().split(","));
        }
      }
    }
    return rows;
  }
}
