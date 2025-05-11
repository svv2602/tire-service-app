<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Действовать как пользователь с определенной ролью и пропустить проверку ролей
     *
     * @param User $user
     * @param string|null $role
     * @return $this
     */
    protected function actingAsWithRole(User $user, ?string $role = null)
    {
        if ($role) {
            $user->role = $role;
            $user->save();
        }

        return $this->actingAs($user)
                    ->withHeader('Accept', 'application/json')
                    ->withHeader('X-Skip-Role-Check', 'true');
    }
}
