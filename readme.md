# install

виконай:
```
python -m venv .venv
source .venv/bin/activate     # або .venv\Scripts\activate на Windows
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```
run
```
python manage.py runserver
```
# Доступні URL

Swagger UI: http://127.0.0.1:8000/swagger/

redoc: http://127.0.0.1:8000/redoc/

Django admin: http://127.0.0.1:8000/admin/

Signup: POST /api/auth/signup/ (створює користувача та повертає access/refresh tokens у полі data.tokens)

Signin (отримати JWT): POST /api/auth/signin/ (тільки username/password by default або email depending on auth backend)

Refresh: POST /api/auth/token/refresh/

Users current: GET /api/users/current/ (Authorization: Bearer <access_token>)

Cars endpoints: GET/POST /api/cars/, GET/PUT/DELETE /api/cars/{id}/

Brands: /api/cars/brands/

Models: /api/cars/models/
