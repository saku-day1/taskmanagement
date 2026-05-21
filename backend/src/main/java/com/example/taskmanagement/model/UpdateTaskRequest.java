package com.example.taskmanagement.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateTaskRequest {
    private String title;
    private String description;
    private LocalDate deadline;
    private Priority priority;
}
