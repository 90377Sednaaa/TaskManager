<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'progress',
        'created_by',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'task_user');
    }

    public function logs()
    {
        return $this->hasMany(TaskLog::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
