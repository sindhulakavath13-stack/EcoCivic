package com.ecocivic.demo;

import com.ecocivic.demo.dto.LoginRequest;
import com.ecocivic.demo.dto.LoginResponse;
import com.ecocivic.demo.entity.User;
import com.ecocivic.demo.exception.BadRequestException;
import com.ecocivic.demo.repository.UserRepository;
import com.ecocivic.demo.security.JwtService;
import com.ecocivic.demo.serviceimpl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ------------------------------------------------------------------
    // registerUser
    // ------------------------------------------------------------------

    @Test
    void registerUser_success_encodesPasswordAndDefaultsRole() {
        User input = new User();
        input.setEmail("alice@test.com");
        input.setPassword("plaintext");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plaintext")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.registerUser(input);

        assertEquals("hashed", result.getPassword());
        assertEquals("user", result.getRole());
        verify(userRepository).save(input);
    }

    @Test
    void registerUser_duplicateEmail_throwsBadRequest() {
        User existing = new User();
        existing.setEmail("dup@test.com");

        when(userRepository.findByEmail("dup@test.com")).thenReturn(Optional.of(existing));

        User input = new User();
        input.setEmail("dup@test.com");
        input.setPassword("pass");

        assertThrows(BadRequestException.class, () -> userService.registerUser(input));
        verify(userRepository, never()).save(any());
    }

    // ------------------------------------------------------------------
    // loginUser
    // ------------------------------------------------------------------

    @Test
    void loginUser_success_returnsTokenAndUserInfo() {
        User stored = new User();
        stored.setId(1L);
        stored.setName("Alice");
        stored.setEmail("alice@test.com");
        stored.setPassword("hashed");
        stored.setRole("user");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(stored));
        when(passwordEncoder.matches("plaintext", "hashed")).thenReturn(true);
        when(jwtService.generateToken("alice@test.com")).thenReturn("jwt-token");

        LoginRequest req = new LoginRequest();
        req.setEmail("alice@test.com");
        req.setPassword("plaintext");

        LoginResponse response = userService.loginUser(req);

        assertEquals("jwt-token", response.getToken());
        assertEquals("Alice", response.getName());
        assertEquals("user", response.getRole());
    }

    @Test
    void loginUser_wrongPassword_throwsBadRequest() {
        User stored = new User();
        stored.setEmail("alice@test.com");
        stored.setPassword("hashed");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(stored));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        LoginRequest req = new LoginRequest();
        req.setEmail("alice@test.com");
        req.setPassword("wrong");

        assertThrows(BadRequestException.class, () -> userService.loginUser(req));
    }

    @Test
    void loginUser_unknownEmail_throwsResourceNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setEmail("unknown@test.com");
        req.setPassword("pass");

        assertThrows(com.ecocivic.demo.exception.ResourceNotFoundException.class,
                () -> userService.loginUser(req));
    }
}
