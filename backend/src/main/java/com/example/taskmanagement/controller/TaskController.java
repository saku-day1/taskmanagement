package com.example.taskmanagement.controller;

import com.example.taskmanagement.model.ReorderRequest;
import com.example.taskmanagement.model.Status;
import com.example.taskmanagement.model.Task;
import com.example.taskmanagement.model.UpdateTaskRequest;
import com.example.taskmanagement.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;


@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<Task> getAll() {
        return taskService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable Long id) {
        return taskService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@RequestBody Task task) {
        return taskService.create(task);
    }

    @PatchMapping("/reorder")
    public List<Task> reorder(@RequestBody ReorderRequest req) {
        return taskService.reorderTasks(req);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @RequestBody UpdateTaskRequest req) {
        try {
            return ResponseEntity.ok(taskService.update(id, req));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        try {
            return ResponseEntity.ok(taskService.updateStatus(id, req.getStatus()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            taskService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    record StatusRequest(Status status) {
        public Status getStatus() { return status; }
    }
}
