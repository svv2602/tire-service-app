<?php

namespace App\Services;

use GuzzleHttp\Client;
use Exception;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected $client;
    protected $firebaseApiKey;

    public function __construct()
    {
        try {
            $this->client = new Client();
            $this->firebaseApiKey = config('services.firebase.api_key', '');
        } catch (Exception $e) {
            Log::error('Error initializing NotificationService', [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function sendPushNotification($tokens, $title, $body, $data = [])
    {
        try {
            if (empty($tokens) || !is_array($tokens) || empty($this->firebaseApiKey)) {
                Log::warning('Push notification not sent due to missing tokens or API key', [
                    'tokens_count' => is_array($tokens) ? count($tokens) : 0,
                    'has_api_key' => !empty($this->firebaseApiKey)
                ]);
                return false;
            }
            
            $url = 'https://fcm.googleapis.com/fcm/send';

            $payload = [
                'registration_ids' => $tokens,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => $data,
            ];

            $headers = [
                'Authorization' => 'key=' . $this->firebaseApiKey,
                'Content-Type' => 'application/json',
            ];

            $response = $this->client->post($url, [
                'headers' => $headers,
                'json' => $payload,
            ]);

            return json_decode($response->getBody(), true);
        } catch (Exception $e) {
            Log::error('Error sending push notification', [
                'error' => $e->getMessage(),
                'tokens_count' => is_array($tokens) ? count($tokens) : 0,
            ]);
            
            return false;
        }
    }
}