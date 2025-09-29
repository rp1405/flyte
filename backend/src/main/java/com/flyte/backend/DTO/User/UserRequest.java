package com.flyte.backend.DTO.User;


import jakarta.validation.constraints.NotBlank;



public class UserRequest {

    @NotBlank(message = "Email is required and cannot be blank.")
    public String email;

    @NotBlank(message = "Name is required and cannot be blank.")
    public String name;

    public String profilePictureUrl;

    public String nickname;

    public String phoneNumber;
}
