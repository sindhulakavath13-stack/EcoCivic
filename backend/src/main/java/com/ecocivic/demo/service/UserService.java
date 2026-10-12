package com.ecocivic.demo.service;

import com.ecocivic.demo.dto.LoginRequest;
import com.ecocivic.demo.dto.LoginResponse;
import com.ecocivic.demo.entity.User;

public interface UserService {

    User registerUser(User user);

    LoginResponse loginUser(LoginRequest request);
}