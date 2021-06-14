### Version

- Python 3.9.5
- Django 3.2.4
- PostgreSQL 13.3

### Step 1. Django 설치

- Django 설치

  - pip install Django==3.2.4

- Django REST framework 설치

  - pip install djangorestframework

- PostgreSQL 연동
  - pip install psycopg2

### Step 2. Django 설정

- Secret Key 생성

  - https://djecrety.ir/ 에서 Secret Key 생성

- 설정 파일 수정

  - aquarium-assets/mysite/settings.py

    - ```
      SECRET_KEY = 'Secret Key'
      ```

    - ```
      DEBUG = True
      ```

    - ```
      DATABASES = {
          'default': {
              'ENGINE': 'django.db.backends.postgresql',
              'NAME': 'DB 명',
              'USER': 'DB 아이디',
              'PASSWORD': 'DB 비밀번호',
              'HOST': '127.0.0.1',
              'PORT': '5432',
          }
      }
      ```

### Step 3. PostgreSQL DB 생성

- DB 생성
  - create database [DB 명]

### Step 4. Django 실행

- Super User 생성

  - ```
    python manage.py createsuperuser
    ```

- DB 마이그레이션

  - ```
    python manage.py makemigrations
    python manage.py migrate
    ```

- Django 실행

  - ```
    python manage.py runserver 0.0.0.0:8000
    ```
