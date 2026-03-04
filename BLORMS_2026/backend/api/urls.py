from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserProfileView, LogoutView, 
    RequestCreateView, RequestListView, RequestDetailView,
    OrganDonationPledgeViewSet, HospitalViewSet, BloodInventoryViewSet,
    AppointmentViewSet, NotificationViewSet, DonorSearchView
)

from . import views

router = DefaultRouter()
router.register(r'organ-pledges', OrganDonationPledgeViewSet, basename='organ-pledge')
router.register(r'hospitals', HospitalViewSet, basename='hospital')
router.register(r'inventory', BloodInventoryViewSet, basename='inventory')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'admin-users', views.AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('requests/', RequestListView.as_view(), name='request-list'),
    path('requests/create/', RequestCreateView.as_view(), name='request-create'),
    path('requests/<int:pk>/', RequestDetailView.as_view(), name='request-detail'),
    path('requests/<int:pk>/accept/', views.AcceptRequestView.as_view(), name='request-accept'),
    
    path('search-donors/', DonorSearchView.as_view(), name='search-donors'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
    path('leaderboard/', views.get_leaderboard, name='leaderboard'),
    path('audit-logs/', views.AuditLogViewSet.as_view({'get': 'list'}), name='audit-logs'),
    
    path('predict-demand/', views.get_prediction, name='predict-demand'),
    path('chatbot/', views.chatbot_response, name='chatbot'),
]
