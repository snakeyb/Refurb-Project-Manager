<?php
namespace Espo\Custom\Api;

use Espo\Core\Api\Action;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Api\ResponseComposer;

class RefurbAuth implements Action
{
    public function process(Request $request): Response
    {
        $secret = $_COOKIE['auth-token-secret'] ?? null;

        return ResponseComposer::json([
            'authTokenSecret' => $secret,
        ]);
    }
}
