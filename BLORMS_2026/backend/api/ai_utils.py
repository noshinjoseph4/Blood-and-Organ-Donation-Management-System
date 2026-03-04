import random

def predict_blood_demand(hospital_id, blood_group):
    """
    Mock AI prediction for blood demand.
    In 2026, this would use time-series forecasting.
    """
    # Mock: Demand is higher during weekend or festivals
    base_demand = random.randint(5, 20)
    return {
        "predicted_units_needed": base_demand,
        "confidence_score": 0.85,
        "trend": "INCREASING" if base_demand > 12 else "STABLE"
    }

def detect_fake_request(user, blood_group, lat, lng):
    """
    Autonomous heuristic to flag suspicious requests.
    Checks:
    1. Rapid consecutive requests from same user.
    2. Large geographical shifts in requested location.
    """
    from .models import AcceptorRequest
    from django.utils import timezone
    from datetime import timedelta
    
    # Check for requests in last 5 minutes (max 3 allowed)
    recent_count = AcceptorRequest.objects.filter(
        user=user, 
        created_at__gte=timezone.now() - timedelta(minutes=5)
    ).count()
    
    if recent_count >= 3:
        return True, "Rate limit exceeded (Flood attempt detected)"
        
    # Check for geographic anomalies (if last request was > 100km away in short time)
    last_req = AcceptorRequest.objects.filter(user=user).order_by('-created_at').first()
    if last_req and last_req.latitude and last_req.longitude:
        from .utils import calculate_distance
        dist = calculate_distance(lat, lng, last_req.latitude, last_req.longitude)
        if dist > 100: # 100km jump in 5 mins is impossible
            return True, "Geographical anomaly detected"
            
    return False, ""

def get_donor_recommendations(request_lat, request_lng, required_blood_group):
    """
    AI Recommendation engine.
    Ranks donors by distance, eligibility, and streak.
    """
    from .models import DonorProfile
    from .utils import calculate_distance
    
    # In a real app, we'd filter by medical compatibility rules (e.g., O- can give to all)
    donors = DonorProfile.objects.filter(blood_group=required_blood_group, is_eligible=True)
    
    recommendations = []
    for profile in donors:
        dist = calculate_distance(request_lat, request_lng, profile.latitude, profile.longitude)
        if dist is None: continue
        
        # Scoring Heuristic (0-100)
        # 1. Distance score (max 40 points, decreased by 4 points per km)
        dist_score = max(0, 40 - (dist * 4))
        
        # 2. Reliability/Streak score (max 20 points)
        streak_score = min(20, profile.donation_streak * 4)
        
        # 3. Urgency/Badge score (max 10 points)
        badge_score = 10 if profile.achievement_points > 1000 else 5
        
        # 4. Response Speed & Frequency (Module 10 - new metrics, max 30 points)
        # Faster response (lower speed value) gives more points
        speed_score = max(0, 15 - (profile.average_response_speed * 2))
        freq_score = min(15, profile.total_donations_count * 2)
        
        total_score = dist_score + streak_score + badge_score + speed_score + freq_score
        
        recommendations.append({
            "id": profile.user.id,
            "username": profile.user.username,
            "blood_group": profile.blood_group,
            "distance": dist,
            "streak": profile.donation_streak,
            "intelligence_score": min(99, total_score),
            "status": "STABLE" if total_score > 70 else "RELIABLE"
        })
    
    # Sort by intelligence score descending
    return sorted(recommendations, key=lambda x: x['intelligence_score'], reverse=True)
