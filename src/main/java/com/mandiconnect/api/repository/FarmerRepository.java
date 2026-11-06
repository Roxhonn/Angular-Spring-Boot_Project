package com.mandiconnect.api.repository;

import com.mandiconnect.api.model.Farmer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
  Optional<Farmer> findByMobile(String mobile);
}
