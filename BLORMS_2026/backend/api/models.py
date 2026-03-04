from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class User(AbstractUser):
    class Role(models.TextChoices):
        DONOR = 'DONOR', 'Donor'
        PATIENT = 'PATIENT', 'Patient'
        HOSPITAL = 'HOSPITAL', 'Hospital'
        BLOOD_BANK = 'BLOOD_BANK', 'Blood Bank'
        ADMIN = 'ADMIN', 'Admin'

    class KYCStatus(models.TextChoices):
        NONE = 'NONE', 'Not Submitted'
        PENDING = 'PENDING', 'Pending Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DONOR)
    kyc_status = models.CharField(max_length=20, choices=KYCStatus.choices, default=KYCStatus.NONE)
    is_verified = models.BooleanField(default=False, help_text="Verified by Admin") # Legacy, but we'll sync it
    id_card_upload = models.FileField(upload_to='kyc/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class DonorProfile(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donor_profile')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    
    # Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    last_donation_date = models.DateField(null=True, blank=True)
    is_eligible = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    
    # Store willing organs as a list of strings
    organs_willingness = models.JSONField(default=list, blank=True)
    
    donation_streak = models.IntegerField(default=0)
    achievement_points = models.IntegerField(default=0)
    
    # AI Performance Metrics
    average_response_speed = models.FloatField(default=0.0, help_text="Average hours to respond to alerts")
    total_donations_count = models.IntegerField(default=0)
    
    # Medical Compatibility (Encrypted at rest)
    age = models.IntegerField(null=True, blank=True)
    is_smoker = models.BooleanField(default=False)
    hla_type = models.CharField(max_length=255, null=True, blank=True, help_text="Encrypted HLA types")

    def save(self, *args, **kwargs):
        from .encryption import HealthSecure
        if self.hla_type and not self.hla_type.startswith("SEC_$"):
            self.hla_type = HealthSecure.encrypt(self.hla_type)
        super().save(*args, **kwargs)

    @property
    def hla_type_decrypted(self):
        from .encryption import HealthSecure
        return HealthSecure.decrypt(self.hla_type)

    def update_eligibility(self):
        is_blood_eligible = True
        if self.last_donation_date:
            days_since = (timezone.now().date() - self.last_donation_date).days
            is_blood_eligible = days_since >= 90
            
        # Check organ pledges (6 months = 180 days lockout)
        is_organ_eligible = True
        latest_pledge = self.user.organ_pledges.order_by('-pledged_at').first()
        if latest_pledge:
            days_since_pledge = (timezone.now().date() - latest_pledge.pledged_at.date()).days
            is_organ_eligible = days_since_pledge >= 180
            
        self.is_eligible = is_blood_eligible and is_organ_eligible
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.blood_group}"

class OrganDonationPledge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organ_pledges')
    organ_name = models.CharField(max_length=50)
    legal_consent_form = models.FileField(upload_to='consent_forms/')
    family_contact_name = models.CharField(max_length=100)
    family_contact_phone = models.CharField(max_length=15)
    pledged_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} pledges {self.organ_name}"

class Hospital(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hospital_profile')
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField()
    license_number = models.CharField(max_length=100, null=True, blank=True)
    license_document = models.FileField(upload_to='hospitals/licenses/', null=True, blank=True)
    is_emergency_listed = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class BloodInventory(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='inventory')
    blood_group = models.CharField(max_length=5, choices=DonorProfile.BLOOD_GROUPS)
    units_available = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('hospital', 'blood_group')

class AcceptorRequest(models.Model):
    REQUEST_TYPES = [
        ('BLOOD', 'Blood'),
        ('ORGAN', 'Organ'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('FULFILLED', 'Fulfilled'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    request_type = models.CharField(max_length=10, choices=REQUEST_TYPES)
    
    blood_group = models.CharField(max_length=5, choices=DonorProfile.BLOOD_GROUPS, null=True, blank=True)
    organ_name = models.CharField(max_length=50, null=True, blank=True)
    
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    hospital_name = models.CharField(max_length=200, null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    is_urgent = models.BooleanField(default=False)
    is_fake_detected = models.BooleanField(default=False) # AI Check
    
    # Medical/compatibility fields
    medical_notes = models.TextField(null=True, blank=True)
    compatibility_requirements = models.JSONField(default=dict, blank=True) # e.g. {"hla": "A2"}
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        from .encryption import HealthSecure
        if self.medical_notes and not self.medical_notes.startswith("SEC_$"):
            self.medical_notes = HealthSecure.encrypt(self.medical_notes)
        super().save(*args, **kwargs)

    @property
    def medical_notes_decrypted(self):
        from .encryption import HealthSecure
        return HealthSecure.decrypt(self.medical_notes)

    def __str__(self):
        spec = self.blood_group if self.request_type == 'BLOOD' else self.organ_name
        return f"{self.get_request_type_display()} Request: {spec} ({self.status})"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    linked_request = models.ForeignKey(AcceptorRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments', help_text="The patient request this appointment is fulfilling.")
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='SCHEDULED')
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.donor.username} at {self.hospital.name} on {self.appointment_date.date()}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'User Login'),
        ('KYC_UPDATE', 'KYC Status Change'),
        ('ROLE_CHANGE', 'User Role Modified'),
        ('INVENTORY_UPDATE', 'Blood Inventory Change'),
        ('REQUEST_FLAGGED', 'Fake Request Detected'),
        ('SENSITIVE_DATA_ACCESS', 'Sensitive Data Accessed'),
    ]
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100) # e.g. "User", "BloodInventory"
    resource_id = models.CharField(max_length=100, null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} - {self.actor} - {self.action}"

