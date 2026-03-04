from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import DonorProfile, AcceptorRequest, Hospital, BloodInventory, Appointment

User = get_user_model()

class DonorProfileInline(admin.StackedInline):
    model = DonorProfile
    can_delete = False
    verbose_name_plural = 'Donor Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    inlines = (DonorProfileInline, )
    list_display = ('username', 'email', 'role', 'kyc_status', 'is_verified', 'is_staff')
    list_filter = ('role', 'kyc_status', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('username',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Verification & Role', {'fields': ('role', 'kyc_status', 'is_verified', 'id_card_upload')}),
    )

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'license_number', 'is_emergency_listed')
    search_fields = ('name', 'license_number')
    list_filter = ('is_emergency_listed',)

@admin.register(BloodInventory)
class BloodInventoryAdmin(admin.ModelAdmin):
    list_display = ('hospital', 'blood_group', 'units_available', 'last_updated')
    list_filter = ('blood_group', 'hospital')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('donor', 'hospital', 'appointment_date', 'status')
    list_filter = ('status', 'appointment_date')

admin.site.register(User, CustomUserAdmin)
admin.site.register(AcceptorRequest)
admin.site.register(DonorProfile)
