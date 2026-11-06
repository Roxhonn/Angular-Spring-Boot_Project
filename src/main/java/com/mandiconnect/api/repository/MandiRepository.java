package com.mandiconnect.api.repository;

import com.mandiconnect.api.model.Mandi;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MandiRepository extends JpaRepository<Mandi, Long> {

  List<Mandi> findByDistrictIgnoreCase(String district);

  boolean existsByNameIgnoreCase(String name);

  Optional<Mandi> findByNameIgnoreCase(String name);
}