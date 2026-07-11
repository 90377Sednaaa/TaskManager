<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskLog;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // GET /api/tasks — Admin dashboard: all tasks + assigned employees
    public function index()
    {
        $tasks = Task::with('users:id,name', 'creator:id,name')->get();

        return response()->json($tasks);
    }

    // POST /api/tasks — create a task and assign employees
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'created_by' => 'required|exists:users,id',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'created_by' => $validated['created_by'],
        ]);

        $task->users()->sync($validated['user_ids']);

        return response()->json($task->load('users:id,name'), 201);
    }

    // GET /api/my-tasks/{userId} — tasks assigned to one employee
    public function myTasks($userId)
    {
        $tasks = Task::whereHas('users', function ($query) use ($userId) {
            $query->where('users.id', $userId);
        })
            ->with('users:id,name', 'creator:id,name')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($tasks);
    }

    // GET /api/tasks/{id}/logs — full update history for one task
    public function logs($id)
    {
        $task = Task::findOrFail($id);

        $logs = $task->logs()->with('user:id,name')->orderBy('created_at', 'desc')->get();

        return response()->json($logs);
    }

    // PATCH /api/tasks/{id}/status — employee updates status/progress/note
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'nullable|in:pending,in_progress,halted,completed',
            'progress' => 'nullable|integer|min:0|max:100',
            'note' => 'nullable|string',
        ]);

        $task = Task::findOrFail($id);

        $progress = $validated['progress'] ?? $task->progress;
        $status = $validated['status'] ?? $task->status;

        // Auto-link progress and status
        if ($progress === 100) {
            $status = 'completed';
        } elseif ($status === 'completed') {
            $progress = 100;
        }

        $log = TaskLog::create([
            'task_id' => $task->id,
            'user_id' => $validated['user_id'],
            'note' => $validated['note'] ?? null,
            'progress_snapshot' => $progress,
            'status_snapshot' => $status,
        ]);

        $task->update([
            'progress' => $progress,
            'status' => $status,
        ]);

        return response()->json($task->fresh());
    }

    // PUT /api/tasks/{id} — admin edits task details + reassigns employees
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        $task->users()->sync($validated['user_ids']);

        return response()->json($task->load('users:id,name', 'creator:id,name'));
    }

    // DELETE /api/tasks/{id} — admin deletes a task
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }
}
