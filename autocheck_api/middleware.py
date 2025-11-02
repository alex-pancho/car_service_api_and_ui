class SwaggerJWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        # Якщо токен без Bearer і це не Basic auth
        if auth and not auth.startswith('Bearer ') and not auth.startswith('Basic '):
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {auth}'
        return self.get_response(request)