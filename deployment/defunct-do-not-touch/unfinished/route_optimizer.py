"""
Route optimization for efficient flight paths.
Implements traveling salesman problem solutions for waypoint visits.
"""

import logging
from typing import List, Tuple, Optional
import numpy as np
from itertools import permutations

from flight_control.drone_interface import GPSPosition

logger = logging.getLogger(__name__)

class RouteOptimizer:
    """Optimizes drone flight routes for efficiency"""
    
    def __init__(self):
        self.distance_cache = {}
    
    def optimize_route(self, 
                      start: GPSPosition,
                      waypoints: List[GPSPosition],
                      return_home: bool = True) -> List[GPSPosition]:
        """
        Optimize route through waypoints using nearest neighbor heuristic.
        For small numbers of waypoints (<8), uses brute force for optimal solution.
        """
        if not waypoints:
            return [start]
        
        # For small sets, find optimal solution
        if len(waypoints) <= 7:
            return self._brute_force_optimize(start, waypoints, return_home)
        
        # For larger sets, use nearest neighbor heuristic
        return self._nearest_neighbor_optimize(start, waypoints, return_home)
    
    def _brute_force_optimize(self,
                             start: GPSPosition,
                             waypoints: List[GPSPosition],
                             return_home: bool) -> List[GPSPosition]:
        """Find optimal route by checking all permutations"""
        logger.info(f"Using brute force optimization for {len(waypoints)} waypoints")
        
        best_distance = float('inf')
        best_route = None
        
        # Check all possible orderings
        for perm in permutations(range(len(waypoints))):
            route = [start]
            current = start
            total_distance = 0
            
            # Visit waypoints in this order
            for idx in perm:
                next_pos = waypoints[idx]
                total_distance += self._get_distance(current, next_pos)
                route.append(next_pos)
                current = next_pos
            
            # Return home if needed
            if return_home:
                total_distance += self._get_distance(current, start)
                route.append(start)
            
            # Check if this is the best route
            if total_distance < best_distance:
                best_distance = total_distance
                best_route = route
        
        logger.info(f"Optimal route found: {best_distance:.1f}m total distance")
        return best_route
    
    def _nearest_neighbor_optimize(self,
                                  start: GPSPosition,
                                  waypoints: List[GPSPosition],
                                  return_home: bool) -> List[GPSPosition]:
        """Use nearest neighbor heuristic for route optimization"""
        logger.info(f"Using nearest neighbor for {len(waypoints)} waypoints")
        
        unvisited = waypoints.copy()
        route = [start]
        current = start
        total_distance = 0
        
        # Visit nearest unvisited waypoint each time
        while unvisited:
            nearest_idx = -1
            nearest_dist = float('inf')
            
            # Find nearest unvisited waypoint
            for i, waypoint in enumerate(unvisited):
                dist = self._get_distance(current, waypoint)
                if dist < nearest_dist:
                    nearest_dist = dist
                    nearest_idx = i
            
            # Visit the nearest waypoint
            current = unvisited.pop(nearest_idx)
            route.append(current)
            total_distance += nearest_dist
        
        # Return home if needed
        if return_home:
            dist_home = self._get_distance(current, start)
            total_distance += dist_home
            route.append(start)
        
        logger.info(f"Route optimized: {total_distance:.1f}m total distance")
        return route
    
    def optimize_coverage_pattern(self,
                                 boundary: List[GPSPosition],
                                 spacing: float = 50.0,
                                 altitude: float = 50.0) -> List[GPSPosition]:
        """
        Generate efficient coverage pattern for area scanning.
        Uses lawnmower pattern within boundary.
        """
        if len(boundary) < 3:
            raise ValueError("Boundary must have at least 3 points")
        
        # Find bounding box
        lats = [p.latitude for p in boundary]
        lons = [p.longitude for p in boundary]
        
        min_lat, max_lat = min(lats), max(lats)
        min_lon, max_lon = min(lons), max(lons)
        
        # Convert spacing from meters to approximate degrees
        # At equator: 1 degree latitude ≈ 111km
        lat_spacing = spacing / 111000
        lon_spacing = spacing / (111000 * np.cos(np.radians(np.mean(lats))))
        
        # Generate lawnmower pattern
        pattern = []
        lat = min_lat
        direction = 1  # 1 for east, -1 for west
        
        while lat <= max_lat:
            if direction == 1:
                # Moving east
                lon = min_lon
                while lon <= max_lon:
                    point = GPSPosition(lat, lon, altitude)
                    if self._point_in_polygon(point, boundary):
                        pattern.append(point)
                    lon += lon_spacing
            else:
                # Moving west
                lon = max_lon
                while lon >= min_lon:
                    point = GPSPosition(lat, lon, altitude)
                    if self._point_in_polygon(point, boundary):
                        pattern.append(point)
                    lon -= lon_spacing
            
            lat += lat_spacing
            direction *= -1
        
        logger.info(f"Generated coverage pattern with {len(pattern)} waypoints")
        return pattern
    
    def calculate_mission_time(self,
                             route: List[GPSPosition],
                             cruise_speed: float = 10.0,
                             hover_time_per_point: float = 0) -> float:
        """Calculate estimated mission time in seconds"""
        if len(route) < 2:
            return hover_time_per_point * len(route)
        
        # Calculate flight time
        total_distance = 0
        for i in range(len(route) - 1):
            total_distance += self._get_distance(route[i], route[i + 1])
        
        flight_time = total_distance / cruise_speed
        
        # Add hover time (excluding start and end if they're the same)
        if route[0] == route[-1]:
            hover_points = len(route) - 2
        else:
            hover_points = len(route) - 1
        
        total_hover_time = hover_points * hover_time_per_point
        
        return flight_time + total_hover_time
    
    def _get_distance(self, p1: GPSPosition, p2: GPSPosition) -> float:
        """Get distance between two points (cached)"""
        # Create cache key
        key = (p1.latitude, p1.longitude, p2.latitude, p2.longitude)
        
        # Check cache
        if key in self.distance_cache:
            return self.distance_cache[key]
        
        # Calculate and cache
        distance = p1.distance_to(p2)
        self.distance_cache[key] = distance
        
        return distance
    
    def _point_in_polygon(self, point: GPSPosition, polygon: List[GPSPosition]) -> bool:
        """Check if point is inside polygon using ray casting algorithm"""
        x, y = point.longitude, point.latitude
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0].longitude, polygon[0].latitude
        
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n].longitude, polygon[i % n].latitude
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        
        return inside
    
    def get_route_stats(self, route: List[GPSPosition]) -> Dict[str, float]:
        """Get statistics about a route"""
        if len(route) < 2:
            return {
                'total_distance': 0,
                'waypoints': len(route),
                'avg_leg_distance': 0,
                'max_leg_distance': 0
            }
        
        distances = []
        total_distance = 0
        
        for i in range(len(route) - 1):
            dist = self._get_distance(route[i], route[i + 1])
            distances.append(dist)
            total_distance += dist
        
        return {
            'total_distance': total_distance,
            'waypoints': len(route),
            'avg_leg_distance': np.mean(distances),
            'max_leg_distance': max(distances),
            'min_leg_distance': min(distances),
            'std_leg_distance': np.std(distances)
        }