#!/usr/bin/env python3
"""
Enhanced Server Configuration
Centralized configuration for queue settings and performance tuning
"""

import os
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class QueueConfig:
    """Queue configuration settings"""
    max_size: int = 30
    max_concurrent: int = 4
    overflow_policy: str = 'drop_lowest_priority'  # 'reject', 'drop_oldest', 'drop_lowest_priority'
    
    # Timeout settings
    request_timeout: int = 60  # seconds
    queue_timeout: int = 30    # seconds
    
    # Priority weights (lower = higher priority)
    priority_weights: Dict[str, int] = None
    
    def __post_init__(self):
        if self.priority_weights is None:
            self.priority_weights = {
                'EMERGENCY': 1,
                'HIGH': 2,
                'NORMAL': 3,
                'LOW': 4
            }

@dataclass
class ServerConfig:
    """Main server configuration"""
    # Server settings
    host: str = '0.0.0.0'
    port: int = 8080
    debug: bool = False
    
    # Memory settings
    memory_limit_gb: int = 30  # Threshold for development vs production
    
    # Performance settings
    max_response_cache_size: int = 100  # Number of responses to cache
    enable_response_streaming: bool = True
    
    # Logging settings
    log_level: str = 'INFO'
    log_file: str = 'logs/server.log'
    
    # Queue settings
    queue: QueueConfig = None
    
    def __post_init__(self):
        if self.queue is None:
            self.queue = QueueConfig()

@dataclass
class DevelopmentConfig(ServerConfig):
    """Development environment configuration"""
    debug: bool = True
    
    def __post_init__(self):
        super().__post_init__()
        # Development-specific queue settings
        self.queue.max_size = 20
        self.queue.max_concurrent = 6  # More concurrent for mock processing
        self.queue.overflow_policy = 'reject'
        self.queue.request_timeout = 30

@dataclass
class ProductionConfig(ServerConfig):
    """Production environment configuration"""
    debug: bool = False
    
    def __post_init__(self):
        super().__post_init__()
        # Production-specific queue settings
        self.queue.max_size = 50
        self.queue.max_concurrent = 3  # Fewer concurrent for real model
        self.queue.overflow_policy = 'drop_lowest_priority'
        self.queue.request_timeout = 120

@dataclass
class EmergencyConfig(ServerConfig):
    """Emergency/crisis mode configuration"""
    debug: bool = False
    
    def __post_init__(self):
        super().__post_init__()
        # Emergency-specific queue settings
        self.queue.max_size = 100
        self.queue.max_concurrent = 6
        self.queue.overflow_policy = 'drop_lowest_priority'
        self.queue.request_timeout = 180
        
        # Prioritize medical and emergency requests
        self.queue.priority_weights = {
            'EMERGENCY': 1,
            'HIGH': 2,
            'NORMAL': 5,
            'LOW': 10
        }

class ConfigManager:
    """Manages configuration based on environment"""
    
    @staticmethod
    def get_config(environment: str = None) -> ServerConfig:
        """Get configuration based on environment"""
        if environment is None:
            environment = os.getenv('REFUGEE_CONNECT_ENV', 'auto')
        
        if environment == 'auto':
            # Auto-detect based on system resources
            import psutil
            memory_gb = psutil.virtual_memory().total / (1024**3)
            
            if memory_gb < 30:
                return DevelopmentConfig()
            else:
                return ProductionConfig()
        
        elif environment == 'development':
            return DevelopmentConfig()
        
        elif environment == 'production':
            return ProductionConfig()
        
        elif environment == 'emergency':
            return EmergencyConfig()
        
        else:
            raise ValueError(f"Unknown environment: {environment}")
    
    @staticmethod
    def load_from_file(config_file: str) -> ServerConfig:
        """Load configuration from JSON file"""
        import json
        
        with open(config_file, 'r') as f:
            config_dict = json.load(f)
        
        # Create appropriate config object
        env_type = config_dict.get('environment', 'development')
        
        if env_type == 'development':
            config = DevelopmentConfig()
        elif env_type == 'production':
            config = ProductionConfig()
        elif env_type == 'emergency':
            config = EmergencyConfig()
        else:
            config = ServerConfig()
        
        # Override with file values
        ConfigManager._update_config_from_dict(config, config_dict)
        
        return config
    
    @staticmethod
    def _update_config_from_dict(config: ServerConfig, config_dict: Dict[str, Any]):
        """Update config object from dictionary"""
        for key, value in config_dict.items():
            if key == 'queue' and isinstance(value, dict):
                # Update queue config
                for queue_key, queue_value in value.items():
                    if hasattr(config.queue, queue_key):
                        setattr(config.queue, queue_key, queue_value)
            elif hasattr(config, key):
                setattr(config, key, value)
    
    @staticmethod
    def save_to_file(config: ServerConfig, config_file: str):
        """Save configuration to JSON file"""
        import json
        
        config_dict = {
            'environment': config.__class__.__name__.replace('Config', '').lower(),
            'host': config.host,
            'port': config.port,
            'debug': config.debug,
            'memory_limit_gb': config.memory_limit_gb,
            'max_response_cache_size': config.max_response_cache_size,
            'enable_response_streaming': config.enable_response_streaming,
            'log_level': config.log_level,
            'log_file': config.log_file,
            'queue': {
                'max_size': config.queue.max_size,
                'max_concurrent': config.queue.max_concurrent,
                'overflow_policy': config.queue.overflow_policy,
                'request_timeout': config.queue.request_timeout,
                'queue_timeout': config.queue.queue_timeout,
                'priority_weights': config.queue.priority_weights
            }
        }
        
        with open(config_file, 'w') as f:
            json.dump(config_dict, f, indent=2)

# Example configurations
def create_camp_config() -> ServerConfig:
    """Configuration optimized for refugee camp deployment"""
    config = ProductionConfig()
    
    # Optimize for limited resources but high demand
    config.queue.max_size = 75
    config.queue.max_concurrent = 4
    config.queue.overflow_policy = 'drop_oldest'
    config.queue.request_timeout = 90
    
    # Prioritize critical services
    config.queue.priority_weights = {
        'EMERGENCY': 1,
        'HIGH': 3,
        'NORMAL': 6,
        'LOW': 12
    }
    
    return config

def create_clinic_config() -> ServerConfig:
    """Configuration optimized for medical clinic deployment"""
    config = ProductionConfig()
    
    # Optimize for medical use cases
    config.queue.max_size = 40
    config.queue.max_concurrent = 2  # Fewer concurrent for accuracy
    config.queue.overflow_policy = 'drop_lowest_priority'
    config.queue.request_timeout = 180  # Longer timeout for medical analysis
    
    # Heavily prioritize medical requests
    config.queue.priority_weights = {
        'EMERGENCY': 1,
        'HIGH': 2,
        'NORMAL': 8,
        'LOW': 20
    }
    
    return config

# Command-line configuration utility
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Server Configuration Utility')
    parser.add_argument('--env', choices=['development', 'production', 'emergency'], 
                       default='auto', help='Environment type')
    parser.add_argument('--save', help='Save configuration to file')
    parser.add_argument('--load', help='Load configuration from file')
    parser.add_argument('--preset', choices=['camp', 'clinic'], help='Use preset configuration')
    
    args = parser.parse_args()
    
    # Get configuration
    if args.load:
        config = ConfigManager.load_from_file(args.load)
    elif args.preset == 'camp':
        config = create_camp_config()
    elif args.preset == 'clinic':
        config = create_clinic_config()
    else:
        config = ConfigManager.get_config(args.env)
    
    # Display configuration
    print("Server Configuration:")
    print(f"  Environment: {config.__class__.__name__}")
    print(f"  Host: {config.host}:{config.port}")
    print(f"  Debug: {config.debug}")
    print(f"  Queue Max Size: {config.queue.max_size}")
    print(f"  Max Concurrent: {config.queue.max_concurrent}")
    print(f"  Overflow Policy: {config.queue.overflow_policy}")
    print(f"  Request Timeout: {config.queue.request_timeout}s")
    
    # Save if requested
    if args.save:
        ConfigManager.save_to_file(config, args.save)
        print(f"Configuration saved to {args.save}")