import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Group, Message

User = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
	async def connect(self):
		self.group_id = self.scope['url_route']['kwargs'].get('group_id')
		self.room_group_name = f"chat_{self.group_id}"

		# Verify group exists
		exists = await self._group_exists(self.group_id)
		if not exists:
			await self.close(code=4004)
			return

		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

	async def receive_json(self, content, **kwargs):
		msg_type = content.get('type')
		payload = content.get('payload')
		if msg_type == 'message' and payload:
			text = payload.get('text')
			sender = payload.get('sender') or 'anonymous'
			message = {
				'id': payload.get('id') or '',
				'sender': sender,
				'text': text,
				'ts': payload.get('ts'),
			}
			# Persist message (optional for demo)
			await self._save_message(sender, self.group_id, text)
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'chat.message',
					'message': message,
				}
			)

	async def chat_message(self, event):
		await self.send_json({
			'type': 'message',
			'payload': event['message']
		})

	@database_sync_to_async
	def _group_exists(self, gid):
		return Group.objects.filter(id=gid).exists()

	@database_sync_to_async
	def _save_message(self, sender_name, gid, text):
		try:
			user = User.objects.filter(username=sender_name).first()
			group = Group.objects.get(id=gid)
			Message.objects.create(sender=user if user else None, group=group, content=text)
		except Group.DoesNotExist:
			pass
