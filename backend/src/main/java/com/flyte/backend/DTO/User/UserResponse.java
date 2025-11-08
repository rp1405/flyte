package com.flyte.backend.DTO.User;

import com.flyte.backend.model.User;

import lombok.Data;

@Data
public class UserResponse {
    public final String name;
    public final String email;
    public final String profilePictureUrl;
    public final String nickname;
    public final String phoneNumber;

    public UserResponse(User user) {
        this.name = user.getName();
        this.email = user.getEmail();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.nickname = user.getNickname();
        this.phoneNumber = user.getPhoneNumber();
    }
}
