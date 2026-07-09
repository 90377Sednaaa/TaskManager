<?php

use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/users', [UserController::class, 'index']);

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::get('/my-tasks/{userId}', [TaskController::class, 'myTasks']);
Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
Route::get('/tasks/{id}/logs', [TaskController::class, 'logs']);
Route::put('/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
