package com.flyte.backend.service;

import com.flyte.backend.model.User;
import com.flyte.backend.repository.UserRepository;
import com.flyte.backend.util.IdGenerator;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findOrCreateUser(String email, String name, String profilePictureUrl) {

        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Create a new user instance
                    User newUser = new User();

                    // Generate and set the ID from the BaseEntity
                    newUser.setId(IdGenerator.generate());

                    // Set the user-specific fields
                    newUser.setName(name);
                    newUser.setEmail(email);
                    newUser.setProfilePictureUrl(profilePictureUrl);

                    System.out.println("Creating new user with ID: " + newUser.getId());
                    return userRepository.save(newUser);
                });
    }
}