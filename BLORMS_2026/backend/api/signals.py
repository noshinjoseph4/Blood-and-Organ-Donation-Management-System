from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import AcceptorRequest

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import AcceptorRequest, User, DonorProfile
from .utils import calculate_distance

@receiver(post_save, sender=AcceptorRequest)
def notify_new_request(sender, instance, created, **kwargs):
    if created and instance.request_type == 'BLOOD' and instance.blood_group:
        channel_layer = get_channel_layer()
        
        # Find all donors with matching blood group
        donors = DonorProfile.objects.filter(blood_group=instance.blood_group).select_related('user')
        
        for donor in donors:
            # Check proximity (e.g., within 20km)
            distance = calculate_distance(donor.latitude, donor.longitude, instance.latitude, instance.longitude)
            
            if distance is not None and distance <= 20:
                user_group_name = f"user_{donor.user.id}"
                
                message = {
                    "type": "blood_request",
                    "request_id": instance.id,
                    "blood_group": instance.blood_group,
                    "requester": instance.user.username,
                    "is_urgent": instance.is_urgent,
                    "distance": distance,
                    "text": f"Nearby {instance.blood_group} blood request ({distance}km away) from {instance.user.username}!"
                }
                
                async_to_sync(channel_layer.group_send)(
                    user_group_name,
                    {
                        "type": "send_notification",
                        "message": message
                    }
                )
