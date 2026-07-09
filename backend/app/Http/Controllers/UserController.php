<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $employees = User::role('employee')->get(['id', 'name', 'email']);

        return response()->json($employees);
    }
}
