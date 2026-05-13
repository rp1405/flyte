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
                    existingUser.setPhoneNumber(userRequest.phoneNumber);
                    // Preserve existing nickname if not provided in request
                    if (userRequest.nickname != null) {
                        existingUser.setNickname(userRequest.nickname);
                    }
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

    public UserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(UserResponse::new)
                .orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findById(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    // Check if a nickname is available (not already taken)
    public boolean isNicknameAvailable(String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            return false;
        }
        return !userRepository.existsByNickname(nickname);
    }

    // Set a user's nickname
    @Transactional
    public UserResponse setUserNickname(UUID userId, String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new IllegalArgumentException("Nickname cannot be empty");
        }

        // Check if nickname is already taken
        if (!isNicknameAvailable(nickname)) {
            throw new IllegalArgumentException("Nickname is already taken");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setNickname(nickname);
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }

}