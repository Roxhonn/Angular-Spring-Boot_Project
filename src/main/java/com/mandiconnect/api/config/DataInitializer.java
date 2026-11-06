
package com.mandiconnect.api.config;

import com.mandiconnect.api.model.Farmer;
import com.mandiconnect.api.model.Mandi;
import com.mandiconnect.api.model.User;
import com.mandiconnect.api.repository.FarmerRepository;
import com.mandiconnect.api.repository.MandiRepository;
import com.mandiconnect.api.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createDemoAccounts(
            UserRepository userRepository,
            FarmerRepository farmerRepository,
            MandiRepository mandiRepository,
            PasswordEncoder passwordEncoder) {

        return args -> initialize(
                userRepository,
                farmerRepository,
                mandiRepository,
                passwordEncoder
        );
    }

    public void initialize(
            UserRepository userRepository,
            FarmerRepository farmerRepository,
            MandiRepository mandiRepository,
            PasswordEncoder passwordEncoder) {

        // 1. Find or create Jeypore Mandi
        Mandi jeyporeMandi = mandiRepository
                .findByNameIgnoreCase("Jeypore Mandi")
                .orElseGet(() -> mandiRepository.save(
                        new Mandi(
                                "Jeypore Mandi",
                                "Koraput",
                                100,
                                "OPEN"
                        )
                ));

        // Ensure the correct district
        jeyporeMandi.setDistrict("Koraput");
        mandiRepository.save(jeyporeMandi);

        // 2. Create or reuse Demo Farmer record
        Farmer farmer = farmerRepository
                .findByMobile("9000000001")
                .orElseGet(() -> farmerRepository.save(
                        new Farmer(
                                "Demo Farmer",
                                "9000000001",
                                "Bhubaneswar",
                                "Khordha"
                        )
                ));

        // 3. Create Farmer login if missing
        createUserIfMissing(
                userRepository,
                passwordEncoder,
                "Demo Farmer",
                "9000000001",
                "Farmer@123",
                "FARMER",
                null,
                farmer
        );


// 4. Configure the existing Jeypore Officer account
        User officer = userRepository
                .findByUsername("jeypore.officer")
                .orElseThrow(() -> new IllegalStateException(
                        "Existing Jeypore Officer account not found"
                ));

        officer.setName("Jeypore Mandi Officer");
        officer.setPasswordHash(
                passwordEncoder.encode("jeypore@123")
        );
        officer.setRole("OFFICER");
        officer.setActive(true);
        officer.setMandi(jeyporeMandi);
        officer.setFarmer(null);

        userRepository.save(officer);

// 5. Deactivate the old Demo Officer account
        userRepository.findByUsername("Odishagovt.officer")
                .ifPresent(oldOfficer -> {
                    oldOfficer.setActive(false);
                    userRepository.save(oldOfficer);
                });

// 6. Create Admin login if missing
        createUserIfMissing(
                userRepository,
                passwordEncoder,
                "Demo Admin",
                "admin",
                "Admin@123",
                "ADMIN",
                null,
                null
        );


        System.out.println("==================================");
        System.out.println(" DEMO ACCOUNTS INITIALIZED ");
        System.out.println(" Farmer: 9000000001");
        System.out.println(" Officer: jeypore.officer");
        System.out.println(" Officer Mandi: Jeypore Mandi");
        System.out.println(" District: Koraput");
        System.out.println(" Admin: admin");
        System.out.println("==================================");
    }

    private void createUserIfMissing(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String name,
            String username,
            String password,
            String role,
            Mandi mandi,
            Farmer farmer) {

        if (userRepository.existsByUsername(username)) {
            System.out.println(
                    "Demo account already exists: " + username
            );
            return;
        }

        User user = new User();

        user.setName(name);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        user.setMandi(mandi);
        user.setFarmer(farmer);

        userRepository.save(user);

        System.out.println("Created demo account: " + username);
    }
}
