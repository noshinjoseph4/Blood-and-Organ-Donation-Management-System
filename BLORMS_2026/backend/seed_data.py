import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blorms_project.settings')
django.setup()

from api.models import User, Hospital, DonorProfile, BloodInventory
from django.contrib.auth import get_user_model

User = get_user_model()

def create_test_users():
    # Credentials: Username, Password (all 'pass123'), Role
    users_to_create = [
        ('donor_rahul', 'DONOR', 'Rahul (Verified Donor)'),
        ('patient_anjali', 'PATIENT', 'Anjali (Emergency Patient)'),
        ('hospital_city', 'HOSPITAL', 'City Hospital (Verified)'),
        ('bloodbank_hub', 'BLOOD_BANK', 'Regional Blood Bank'),
        ('admin_boss', 'ADMIN', 'System Administrator'),
    ]

    for username, role, full_name in users_to_create:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'role': role, 'email': f'{username}@example.com', 'is_verified': True}
        )
        user.set_password('pass123')
        user.save()
        
        if created:
            print(f"Created {role}: {username}")
        else:
            print(f"Updated {role}: {username}")

        # Create Profile for Donors
        if role == 'DONOR':
            DonorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'blood_group': 'O+',
                    'latitude': 9.9312,
                    'longitude': 76.2673, # Kochi
                    'address': 'Kochi, Kerala',
                    'donation_streak': 5, # To show Bronze badge
                    'achievement_points': 500,
                    'is_eligible': True
                }
            )

        # Create Profile for Hospital
        if role == 'HOSPITAL':
            hosp, _ = Hospital.objects.get_or_create(
                user=user,
                defaults={
                    'name': full_name,
                    'latitude': 9.9312,
                    'longitude': 76.2673,
                    'address': 'Kochi Central Drive',
                    'license_number': 'HOSP-2026-XYZ',
                    'is_emergency_listed': True
                }
            )
            # Seed Inventory
            BloodInventory.objects.get_or_create(
                hospital=hosp,
                blood_group='O+',
                defaults={'units_available': 10}
            )

if __name__ == '__main__':
    create_test_users()
    print("\nSUCCESS: Test accounts are ready!")
    print("Default Password for all accounts: pass123")
