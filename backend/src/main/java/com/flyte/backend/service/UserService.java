package com.flyte.backend.service;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SyncService syncService;

    public UserService(UserRepository userRepository, SyncService syncService) {
        this.userRepository = userRepository;
        this.syncService = syncService;
    }

    @Transactional
    public UserResponse findOrCreateUser(UserRequest userRequest) {
        User user = userRepository.findByEmail(userRequest.email)
                .map(existingUser -> {
                    // Update existing user's information if needed
                    existingUser.setName(userRequest.name);
                    existingUser.setProfilePictureUrl(userRequest.profilePictureUrl);
                    existingUser.setNickname(userRequest.nickname);
                    existingUser.setPhoneNumber(userRequest.phoneNumber);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setName(userRequest.name);
                    newUser.setEmail(userRequest.email);
                    newUser.setProfilePictureUrl(userRequest.profilePictureUrl);
                    newUser.setNickname(userRequest.nickname);
                    newUser.setPhoneNumber(userRequest.phoneNumber);
                    return userRepository.save(newUser);
                });

        syncService.resetSyncTime(user.getId());
        return new UserResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponse::new)
                .orElse(null);
    }

    public UserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(UserResponse::new)
                .orElse(null);
    }

}