from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Hospital

class PermissionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a donor
        self.donor = User.objects.create_user(username='donor', password='password', role='DONOR')
        
        # Create an unverified hospital
        self.unverified_hospital_user = User.objects.create_user(username='hosp_unv', password='password', role='HOSPITAL')
        self.unverified_hospital_user.is_verified = False
        self.unverified_hospital_user.save()
        Hospital.objects.create(
            user=self.unverified_hospital_user,
            name='Unverified Hospital',
            latitude=0, longitude=0, address='Test'
        )
        
        # Create a verified hospital
        self.verified_hospital_user = User.objects.create_user(username='hosp_ver', password='password', role='HOSPITAL')
        self.verified_hospital_user.is_verified = True
        self.verified_hospital_user.save()
        Hospital.objects.create(
            user=self.verified_hospital_user,
            name='Verified Hospital',
            latitude=0, longitude=0, address='Test'
        )

        self.url = reverse('request-create')

    def test_donor_cannot_create_request(self):
        self.client.force_authenticate(user=self.donor)
        response = self.client.post(self.url, {
            'request_type': 'BLOOD',
            'blood_group': 'O+',
            'hospital_name': 'Test Hospital'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unverified_hospital_cannot_create_request(self):
        self.client.force_authenticate(user=self.unverified_hospital_user)
        response = self.client.post(self.url, {
            'request_type': 'BLOOD',
            'blood_group': 'O+',
            'hospital_name': 'Test Hospital'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_verified_hospital_can_create_request(self):
        self.client.force_authenticate(user=self.verified_hospital_user)
        response = self.client.post(self.url, {
            'request_type': 'BLOOD',
            'blood_group': 'O+',
            'hospital_name': 'Test Hospital',
            'latitude': 0,
            'longitude': 0
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
