import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            # Join groups based on blood group if profile exists
            try:
                profile = await self.get_user_profile(self.user)
                if profile and profile.blood_group:
                    self.blood_group_name = f"blood_{profile.blood_group.replace('+', 'pos').replace('-', 'neg')}"
                    await self.channel_layer.group_add(
                        self.blood_group_name,
                        self.channel_name
                    )
            except Exception:
                pass
            
            # Also join a personal group for direct notifications
            self.user_group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        # Leave groups on disconnect
        if hasattr(self, 'blood_group_name'):
            await self.channel_layer.group_discard(
                self.blood_group_name,
                self.channel_name
            )
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event["message"]))

    # Helper method to get user profile (using sync_to_async if needed)
    from channels.db import database_sync_to_async
    @database_sync_to_async
    def get_user_profile(self, user):
        from .models import DonorProfile
        try:
            return DonorProfile.objects.get(user=user)
        except DonorProfile.DoesNotExist:
            return None
