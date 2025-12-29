from django.core.management.base import BaseCommand, CommandError
from apps.users.models import User

class Command(BaseCommand):
    help = 'Set role for a user by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str)
        parser.add_argument('role', type=str)
        parser.add_argument('--staff', action='store_true')
        parser.add_argument('--superuser', action='store_true')

    def handle(self, *args, **options):
        email = options['email']
        role = options['role'].upper()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError(f'User with email {email} does not exist')
        user.role = role
        if options['staff']:
            user.is_staff = True
        if options['superuser']:
            user.is_superuser = True
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Updated {email} role to {role}'))
