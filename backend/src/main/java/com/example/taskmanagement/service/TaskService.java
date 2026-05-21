package com.example.taskmanagement.service;

import com.example.taskmanagement.model.Status;
import com.example.taskmanagement.model.Task;
import com.example.taskmanagement.model.UpdateTaskRequest;
import com.example.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public Task create(Task task) {
        return taskRepository.save(task);
    }

    public Task update(Long id, UpdateTaskRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found: " + id));
        if (req.getTitle() != null) task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setDeadline(req.getDeadline());
        task.setPriority(req.getPriority());
        return taskRepository.save(task);
    }

    public Task updateStatus(Long id, Status status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found: " + id));
        task.setStatus(status);
        return taskRepository.save(task);
    }
}
