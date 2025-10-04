package com.flyte.backend.DTO.User;

import com.flyte.backend.model.BaseEntity;
import com.flyte.backend.model.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserResponse extends BaseEntity {
    public final String name;
    public final String email;
    public final String profilePictureUrl;
    public final String nickname;
    public final String phoneNumber;

    public UserResponse(User user) {
        this.setId(user.getId());
        this.setCreatedAt(user.getCreatedAt());
        this.setUpdatedAt(user.getUpdatedAt());
        this.name = user.getName();
        this.email = user.getEmail();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.nickname = user.getNickname();
        this.phoneNumber = user.getPhoneNumber();
    }
}
