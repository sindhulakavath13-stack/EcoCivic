package com.ecocivic.demo.controller;

import com.ecocivic.demo.dto.LoginRequest;
import com.ecocivic.demo.dto.LoginResponse;
import com.ecocivic.demo.entity.User;
import com.ecocivic.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Authentication and user management")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public LoginResponse loginUser(@RequestBody LoginRequest request) {
        return userService.loginUser(request);
    }
}