<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\MapService;
use Illuminate\Support\Facades\Http;
use Mockery;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;

class MapServiceTest extends TestCase
{
    public function test_geocode_address()
    {
        $mockStream = Mockery::mock(\Psr\Http\Message\StreamInterface::class);
        $mockStream->shouldReceive('__toString')->andReturn(json_encode([
            'results' => [
                [
                    'geometry' => [
                        'location' => [
                            'lat' => 50.4501,
                            'lng' => 30.5234
                        ]
                    ]
                ]
            ]
        ]));
        
        $mockResponse = Mockery::mock(\Psr\Http\Message\ResponseInterface::class);
        $mockResponse->shouldReceive('getBody')->andReturn($mockStream);
        $mockClient = Mockery::mock(\GuzzleHttp\Client::class);
        $mockClient->shouldReceive('get')->andReturn($mockResponse);
        
        $mapService = new MapService();
        $mapService->setClient($mockClient);
        $coordinates = $mapService->getCoordinates('123 Test Street');
        
        $this->assertEquals(50.4501, $coordinates['lat']);
        $this->assertEquals(30.5234, $coordinates['lng']);
    }
}