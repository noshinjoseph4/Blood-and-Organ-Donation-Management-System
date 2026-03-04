from rest_framework import status, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.db.models import F
from django.utils import timezone
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    OrganDonationPledgeSerializer, HospitalSerializer, BloodInventorySerializer,
    AppointmentSerializer, NotificationSerializer, AcceptorRequestSerializer,
    AuditLogSerializer
)
from .models import (
    User, DonorProfile, OrganDonationPledge, Hospital, 
    BloodInventory, AcceptorRequest, Appointment, Notification, AuditLog
)
from .ai_utils import predict_blood_demand, detect_fake_request as ai_detect_fake
from .utils import calculate_distance, create_audit_log

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email,
                'role': user.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            
            create_audit_log(
                actor=user,
                action='LOGIN',
                resource_type='User',
                resource_id=str(user.id),
                details={'method': 'Token Auth'},
                request=request
            )

            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username,
                'role': user.role
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        old_kyc_status = self.request.user.kyc_status
        
        # If id_card_upload is being updated, set kyc_status to PENDING
        if 'id_card_upload' in self.request.FILES:
            serializer.instance.kyc_status = User.KYCStatus.PENDING
        
        user = serializer.save()
        new_kyc_status = user.kyc_status

        if old_kyc_status != new_kyc_status:
            create_audit_log(
                actor=self.request.user,
                action='KYC_UPDATE',
                resource_type='User',
                resource_id=str(user.id),
                details={
                    'old_status': old_kyc_status,
                    'new_status': new_kyc_status,
                    'event': 'ID Card Submitted' if 'id_card_upload' in self.request.FILES else 'Status Manually Updated'
                },
                request=self.request
            )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        
        # Admins can manually override Verification and Role
        if 'is_verified' in request.data:
            user.is_verified = request.data['is_verified']
            if user.is_verified:
                user.kyc_status = User.KYCStatus.VERIFIED
                if getattr(user, 'hospital_profile', None):
                    user.hospital_profile.is_emergency_listed = True
                    user.hospital_profile.save()
            else:
                user.kyc_status = User.KYCStatus.REJECTED
                
        if 'role' in request.data:
            user.role = request.data['role']
            
        user.save()
        return Response(UserProfileSerializer(user).data)

class OrganDonationPledgeViewSet(viewsets.ModelViewSet):
    serializer_class = OrganDonationPledgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = OrganDonationPledge.objects.select_related('user')
        if self.request.user.role == User.Role.ADMIN:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class BloodInventoryViewSet(viewsets.ModelViewSet):
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = BloodInventory.objects.select_related('hospital', 'hospital__user')
        
        # If hospital user, only show their own inventory by default unless explicitly searching
        if user.role == User.Role.HOSPITAL:
            queryset = queryset.filter(hospital__user=user)
            
        hospital_id = self.request.query_params.get('hospital_id')
        blood_group = self.request.query_params.get('blood_group')
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)
        if blood_group:
            queryset = queryset.filter(blood_group=blood_group)
        return queryset

    def perform_create(self, serializer):
        # Auto-assign hospital if the user is a hospital user
        if self.request.user.role == User.Role.HOSPITAL:
            instance = serializer.save(hospital=self.request.user.hospital_profile)
        else:
            instance = serializer.save()
        
        create_audit_log(
            actor=self.request.user,
            action='INVENTORY_UPDATE',
            resource_type='BloodInventory',
            resource_id=str(instance.id),
            details={'units': instance.units_available, 'blood_group': instance.blood_group},
            request=self.request
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        create_audit_log(
            actor=self.request.user,
            action='INVENTORY_UPDATE',
            resource_type='BloodInventory',
            resource_id=str(instance.id),
            details={'units': instance.units_available, 'blood_group': instance.blood_group},
            request=self.request
        )

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.select_related('donor', 'hospital', 'donor__donor_profile')
        if user.role == User.Role.HOSPITAL:
            return queryset.filter(hospital__user=user)
        if user.role == User.Role.DONOR:
            return queryset.filter(donor=user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        # Automate Inventory and Request Fulfillment if marked as COMPLETED
        if instance.status == 'COMPLETED':
            try:
                # 1. Update Inventory
                blood_group = instance.donor.donor_profile.blood_group
                inventory, created = BloodInventory.objects.get_or_create(
                    hospital=instance.hospital,
                    blood_group=blood_group,
                    defaults={'units_available': 0}
                )
                inventory.units_available += 1
                inventory.save()
                
                # 2. Update Donor's eligibility & streaks
                profile = instance.donor.donor_profile
                profile.last_donation_date = timezone.now().date()
                profile.donation_streak += 1
                profile.achievement_points += 100
                profile.update_eligibility()

                # 3. Notify Donor
                Notification.objects.create(
                    user=instance.donor,
                    title="Hero Points Earned! 🏅",
                    message=f"Thank you for saving a life at {instance.hospital.name}! You earned 100 Hero Points and your streak is now {profile.donation_streak}."
                )

                # 4. Automate fulfillment of linked Patient Request
                if instance.linked_request:
                    patient_req = instance.linked_request
                    patient_req.status = 'FULFILLED'
                    patient_req.save()
                    
                    # Notify Patient
                    Notification.objects.create(
                        user=patient_req.user,
                        title="Request Fulfilled! ❤️",
                        message=f"Great news! Your {patient_req.get_request_type_display()} request has been successfully fulfilled by a donor hero."
                    )

            except Exception as e:
                print(f"Fulfillment automation failed: {e}")

    @action(detail=False, methods=['get'])
    def queue(self, request):
        """Returns today's appointments for the hospital."""
        if request.user.role != User.Role.HOSPITAL:
            return Response({"error": "Unauthorized"}, status=403)
            
        today = timezone.now().date()
        appointments = self.get_queryset().filter(
            appointment_date__date=today,
            status='SCHEDULED'
        ).order_by('appointment_date')
        
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class RequestCreateView(generics.CreateAPIView):
    queryset = AcceptorRequest.objects.all()
    serializer_class = AcceptorRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        
        # SECURITY: Only verified hospitals can create requests
        # In a real 2026 system, we'd also allow admins to create on behalf of patients
        if user.role != User.Role.HOSPITAL and user.role != User.Role.ADMIN:
            create_audit_log(
                actor=user,
                action='SENSITIVE_DATA_ACCESS',
                resource_type='AcceptorRequest',
                details={'error': 'Unauthorized role attempt to create request', 'role': user.role},
                request=self.request
            )
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only hospitals or admins can create requests.")

        if user.role == User.Role.HOSPITAL and not user.is_verified:
            create_audit_log(
                actor=user,
                action='SENSITIVE_DATA_ACCESS',
                resource_type='AcceptorRequest',
                details={'error': 'Unverified hospital attempt to create request'},
                request=self.request
            )
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Hospital account must be verified by admin before creating requests.")

        # AI Integrity Check
        blood_group = self.request.data.get('blood_group')
        lat = self.request.data.get('latitude')
        lng = self.request.data.get('longitude')
        
        is_fake, reason = ai_detect_fake(self.request.user, blood_group, lat, lng)
        
        req = serializer.save(user=self.request.user, is_fake_detected=is_fake)
        
        if is_fake:
            create_audit_log(
                actor=self.request.user,
                action='REQUEST_FLAGGED',
                resource_type='AcceptorRequest',
                resource_id=str(req.id),
                details={"reason": reason},
                request=self.request
            )
            # Notify Admins or Log locally
            print(f"SECURITY ALERT: Fake request detected from {self.request.user.username}. Reason: {reason}")
            # We still save it but mark it as fake so it doesn't broadcast to real donors
            return

        if req.is_urgent:
            # SOS logic - Broadcast to blood group matching donors
            try:
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()
                
                blood_group_name = f"blood_{req.blood_group.replace('+', 'pos').replace('-', 'neg')}"
                async_to_sync(channel_layer.group_send)(
                    blood_group_name,
                    {
                        "type": "send_notification",
                        "message": {
                            "text": f"URGENT: {req.blood_group} required at {req.location_name or 'Nearby Hospital'}!",
                            "is_urgent": True,
                            "request_id": req.id
                        }
                    }
                )
            except Exception as e:
                print(f"Broadcast failed: {e}")
            
            Notification.objects.create(
                user=self.request.user,
                title="SOS Request Created",
                message=f"Your urgent {req.request_type} request for {req.blood_group or req.organ_name} has been broadcasted."
            )

class RequestListView(generics.ListAPIView):
    queryset = AcceptorRequest.objects.all()
    serializer_class = AcceptorRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = AcceptorRequest.objects.select_related('user').order_by('-created_at')
        req_type = self.request.query_params.get('type')
        blood_group = self.request.query_params.get('blood_group')
        my_requests = self.request.query_params.get('my_requests')

        if req_type:
            queryset = queryset.filter(request_type=req_type)
        if blood_group:
            queryset = queryset.filter(blood_group=blood_group)
        if my_requests == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
            
        return queryset.order_by('-created_at')

class RequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AcceptorRequest.objects.select_related('user').all()
    serializer_class = AcceptorRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE'] and obj.user != request.user and request.user.role != User.Role.ADMIN:
             self.permission_denied(request, message="Not authorized.")

class AcceptRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != User.Role.DONOR:
            return Response({"error": "Only donors can accept requests."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            acceptor_request = AcceptorRequest.objects.get(pk=pk)
        except AcceptorRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if acceptor_request.status != 'PENDING':
            return Response({"error": "This request is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Optional: AI Eligibility/Matching check could go here
        donor_profile = request.user.donor_profile
        if acceptor_request.request_type == 'BLOOD' and acceptor_request.blood_group != donor_profile.blood_group:
             return Response({"error": "Blood group mismatch."}, status=status.HTTP_400_BAD_REQUEST)
             
        # Find the hospital associated with the request
        # In this simplified model, requests are broadcasted and Hospitals create them OR patients create them targeting a hospital
        # If it's a broadcast without a specific hospital link in the DB, we might assign a nearby hospital or require the donor to select one.
        # For our 2026 specs, AcceptorRequest was created by a Hospital or Admin on behalf of a patient.
        # Let's assume the request's creator is the hospital, or we find a nearby one.
        hospital = getattr(acceptor_request.user, 'hospital_profile', None)
        if not hospital:
            # Fallback to the first available hospital if the request wasn't created directly by a hospital
            hospital = Hospital.objects.first()
            
        # Create the Scheduled Appointment linking the Donor, the Request, and the Hospital
        appointment = Appointment.objects.create(
            donor=request.user,
            hospital=hospital,
            linked_request=acceptor_request,
            appointment_date=timezone.now() + timezone.timedelta(days=1), # schedule for tomorrow by default
            status='SCHEDULED',
            notes="Automatically scheduled via Donor Acceptance."
        )
        
        # Update the Request Status
        acceptor_request.status = 'ACCEPTED'
        acceptor_request.save()
        
        # Log the acceptance
        create_audit_log(
            actor=request.user,
            action='REQUEST_ACCEPTED',
            resource_type='AcceptorRequest',
            resource_id=str(acceptor_request.id),
            details={"appointment_id": appointment.id},
            request=request
        )
        
        # Notify the original requester
        Notification.objects.create(
            user=acceptor_request.user,
            title="Request Accepted! 🩸",
            message=f"A matching donor has accepted your {acceptor_request.get_request_type_display()} request. An appointment is scheduled at {hospital.name}."
        )
        
        return Response({"message": "Request accepted successfully.", "appointment_id": appointment.id}, status=status.HTTP_200_OK)

class DonorSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blood_group = request.query_params.get('blood_group')
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if not blood_group:
            return Response({"error": "blood_group is required"}, status=400)
        donors = DonorProfile.objects.select_related('user').filter(blood_group=blood_group, is_eligible=True)
        results = []

        for profile in donors:
            dist = None
            if lat and lng:
                dist = calculate_distance(float(lat), float(lng), profile.latitude, profile.longitude)
            
            results.append({
                "username": profile.user.username,
                "phone": profile.user.phone_number,
                "distance": dist,
                "streak": profile.donation_streak
            })

        # Sort by distance if available
        if lat and lng:
            results.sort(key=lambda x: x['distance'] if x['distance'] is not None else float('inf'))

        return Response(results)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_recommendations(request):
    """
    AI recommendations endpoint for hospitals.
    Enhanced with HLA and Medical compatibility matching.
    """
    if request.user.role != User.Role.HOSPITAL and not request.user.is_staff:
        return Response({"error": "Unauthorized."}, status=403)
        
    blood_group = request.query_params.get('blood_group')
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    req_type = request.query_params.get('request_type', 'BLOOD')
    hla_req = request.query_params.get('hla_type') # For organ matching
    
    if not (lat and lng):
        h_prof = getattr(request.user, 'hospital_profile', None)
        if h_prof: lat, lng = h_prof.latitude, h_prof.longitude
            
    if not (lat and lng and blood_group):
        return Response({"error": "Missing params"}, status=400)
        
    from .ai_utils import get_donor_recommendations
    try:
        recommendations = get_donor_recommendations(float(lat), float(lng), blood_group)
        
        # Add Medical Compatibility Score
        for rec in recommendations:
            comp_score = 100
            if req_type == 'ORGAN' and hla_req:
                donor = User.objects.get(id=rec['id']).donor_profile
                # Mock HLA Matching logic
                if donor.hla_type == hla_req: comp_score = 100
                elif donor.hla_type and hla_req[0] == donor.hla_type[0]: comp_score = 70
                else: comp_score = 30
            rec['compatibility_score'] = comp_score
            rec['intelligence_score'] = (rec['intelligence_score'] + comp_score) // 2

        return Response(recommendations)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_leaderboard(request):
    """
    Global Hero Ranking with 15-minute caching.
    """
    from django.core.cache import cache
    cache_key = 'global_leaderboard'
    results = cache.get(cache_key)
    
    if not results:
        donors = DonorProfile.objects.select_related('user').all().order_by('-achievement_points')[:50]
        results = []
        for d in donors:
            results.append({
                "username": d.user.username,
                "points": d.achievement_points,
                "streak": d.donation_streak,
                "rank": len(results) + 1
            })
        cache.set(cache_key, results, 900) # 15 minutes
        
    return Response(results)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_analytics_summary(request):
    """
    Strategic analytics for Module 11 (Admin/Hospital).
    Returns donation trends, inventory heatmap, and user activity.
    """
    if request.user.role not in [User.Role.ADMIN, User.Role.HOSPITAL]:
        return Response({"error": "Unauthorized"}, status=403)

    from django.db.models import Count, Sum
    from datetime import timedelta
    
    # 1. Monthly Donation Trends (Last 6 months)
    six_months_ago = timezone.now().date() - timedelta(days=180)
    month_trends = (Appointment.objects.filter(status='COMPLETED', appointment_date__gte=six_months_ago)
                   .extra(select={'month': "strftime('%%m', appointment_date)"})
                   .values('month')
                   .annotate(count=Count('id'))
                   .order_by('month'))

    # 2. Demand Heatmap (Top blood groups needed)
    top_needed = (AcceptorRequest.objects.filter(status='PENDING')
                 .values('blood_group')
                 .annotate(requests=Count('id'))
                 .order_by('-requests')[:5])

    # 3. Supply status (Inventory totals)
    inventory_sum = (BloodInventory.objects.values('blood_group')
                    .annotate(total_units=Sum('units_available'))
                    .order_by('blood_group'))

    return Response({
        "trends": list(month_trends),
        "most_needed": list(top_needed),
        "inventory": list(inventory_sum),
        "totals": {
            "active_donors": User.objects.filter(role='DONOR').count(),
            "active_requests": AcceptorRequest.objects.filter(status='PENDING').count(),
            "hospital_partners": Hospital.objects.count()
        }
    })

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        queryset = AuditLog.objects.select_related('actor').order_by('-timestamp')
        if self.request.user.role == User.Role.ADMIN:
            return queryset
        return queryset.filter(actor=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_prediction(request):
    """
    Exposes the AI Prediction for blood demand.
    """
    if request.user.role not in [User.Role.ADMIN, User.Role.HOSPITAL]:
        return Response({"error": "Unauthorized"}, status=403)
        
    blood_group = request.query_params.get('blood_group', 'O-')
    hospital_prof = getattr(request.user, 'hospital_profile', None)
    hospital_id = hospital_prof.id if hospital_prof else 1
    
    from .ai_utils import predict_blood_demand
    prediction = predict_blood_demand(hospital_id, blood_group)
    
    return Response(prediction)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chatbot_response(request):
    """
    AI Chatbot Endpoint.
    """
    query = request.data.get('query', '').lower()
    
    botResponse = "I'm analyzing your request..."
    if 'eligible' in query or 'eligibility' in query:
        botResponse = "To be eligible to donate blood, you should be at least 18 years old, weigh at least 50kg, and not have donated in the last 90 days. Pledging an organ also pauses other donation eligibility for 6 months. Would you like me to check your profile eligibility status?"
    elif 'organ' in query or 'pledge' in query:
        botResponse = "Organ donation is a noble choice. You can pledge organs like Kidney, Liver, Heart, and Lungs through our 'Organ Pledge' module available on your profile. Note that making a pledge pauses other donation eligibility for 6 months."
    elif 'emergency' in query or 'sos' in query:
        botResponse = "If this is an emergency, use the SOS button on your dashboard. It will broadcast your request to all compatible donors within a 50km radius immediately."
    elif 'where' in query or 'hospital' in query or 'near' in query:
        botResponse = "You can find verified hospital partners near you on the Map interface, or by checking the 'Nearby Facilities' section on your dashboard."
    else:
        botResponse = "That's a great question. In our 2026 system, we use proximity matching and AI to ensure blood reaches patients faster. Is there anything specific about the donation process you'd like to know?"
        
    import time
    time.sleep(1) # simulate AI processing latency
    return Response({"response": botResponse})
