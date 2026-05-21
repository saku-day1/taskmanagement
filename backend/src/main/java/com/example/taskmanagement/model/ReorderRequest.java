package com.example.taskmanagement.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReorderRequest {
    private Status status;
    private List<Long> orderedIds;
}
