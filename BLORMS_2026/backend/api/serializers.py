from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, DonorProfile, OrganDonationPledge, Hospital, 
    BloodInventory, AcceptorRequest, Appointment, Notification, AuditLog
)

class DonorProfileSerializer(serializers.ModelSerializer):
    hla_type = serializers.CharField(source='hla_type_decrypted', required=False)
    
    class Meta:
        model = DonorProfile
        fields = ['blood_group', 'latitude', 'longitude', 'address', 'last_donation_date', 
                  'is_eligible', 'is_available', 'organs_willingness', 'donation_streak', 
                  'achievement_points', 'average_response_speed', 'total_donations_count',
                  'age', 'is_smoker', 'hla_type']
        read_only_fields = ['is_eligible', 'donation_streak', 'achievement_points', 'average_response_speed', 'total_donations_count']

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'license_number', 'license_document', 'is_emergency_listed']

class OrganDonationPledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganDonationPledge
        fields = '__all__'
        read_only_fields = ['user', 'pledged_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    donor_profile = DonorProfileSerializer(required=False)
    hospital_profile = HospitalSerializer(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number', 'donor_profile', 'hospital_profile']

    def create(self, validated_data):
        donor_profile_data = validated_data.pop('donor_profile', None)
        hospital_profile_data = validated_data.pop('hospital_profile', None)
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        # Default to unverified unless admin/system-set
        user.is_verified = False 
        user.save()

        if user.role == 'DONOR' and donor_profile_data:
            DonorProfile.objects.create(user=user, **donor_profile_data)
        elif user.role == 'HOSPITAL' and hospital_profile_data:
            Hospital.objects.create(user=user, **hospital_profile_data)
        
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")

class UserProfileSerializer(serializers.ModelSerializer):
    donor_profile = DonorProfileSerializer(required=False)
    hospital_profile = HospitalSerializer(required=False, read_only=True)
    organ_pledges = OrganDonationPledgeSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'is_verified', 'kyc_status', 'id_card_upload', 'donor_profile', 'hospital_profile', 'organ_pledges']
        read_only_fields = ['id', 'username', 'role', 'is_verified']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('donor_profile', None)
        
        # Update User fields
        instance.email = validated_data.get('email', instance.email)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.save()

        # Update or create DonorProfile
        if profile_data:
            if hasattr(instance, 'donor_profile'):
                profile = instance.donor_profile
                for attr, value in profile_data.items():
                    setattr(profile, attr, value)
                profile.save()
            else:
                DonorProfile.objects.create(user=instance, **profile_data)
        
        return instance



class BloodInventorySerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    class Meta:
        model = BloodInventory
        fields = ['id', 'hospital', 'hospital_name', 'blood_group', 'units_available', 'last_updated']

class AppointmentSerializer(serializers.ModelSerializer):
    donor_username = serializers.CharField(source='donor.username', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    class Meta:
        model = Appointment
        fields = ['id', 'donor', 'donor_username', 'hospital', 'hospital_name', 'appointment_date', 'status', 'notes', 'linked_request']
        read_only_fields = ['donor']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

from .models import AcceptorRequest
from .utils import calculate_distance

class AcceptorRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    distance = serializers.SerializerMethodField()
    medical_notes = serializers.CharField(source='medical_notes_decrypted', required=False)

    class Meta:
        model = AcceptorRequest
        fields = ['id', 'user', 'user_username', 'request_type', 'blood_group', 
                  'organ_name', 'latitude', 'longitude', 'hospital_name', 'status', 'is_urgent', 
                  'is_fake_detected', 'created_at', 'distance', 'medical_notes', 'compatibility_requirements']
        read_only_fields = ['user', 'created_at', 'status', 'is_fake_detected']

    def get_distance(self, obj):
        request = self.context.get('request')
        if not request:
            return None
            
        # Get lat/lng from query params (for anonymous or specific search)
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        # Or from authenticated user's profile
        if not lat and not lng and request.user.is_authenticated:
            try:
                profile = request.user.donor_profile
                lat, lng = profile.latitude, profile.longitude
            except Exception:
                pass
                
        if lat and lng:
            try:
                return calculate_distance(float(lat), float(lng), obj.latitude, obj.longitude)
            except (ValueError, TypeError):
                pass
        return None

    def create(self, validated_data):
        # Assign current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)
    class Meta:
        model = AuditLog
        fields = '__all__'
