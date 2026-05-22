package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t ORDER BY CASE WHEN t.displayOrder IS NULL THEN 1 ELSE 0 END ASC, t.displayOrder ASC, t.createdAt DESC")
    List<Task> findAllOrdered();
}
