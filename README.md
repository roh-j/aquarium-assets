## Aquarium Assets

### 🦊 Features

- 그래픽으로 한 눈에 매장을 관리하는 **매장 관리 기능**

- 생물에 특화된 **단가 관리 기능**

- 주문을 쉽게 작성하고 처리할 수 있는 **주문 관리 기능**

- 주문과 연동되어 재고를 관리할 수 있는 **재고 관리 기능**

### 🍩 Introduction

![screenshot-pokbeon com-2019 11 04-16_56_33](https://user-images.githubusercontent.com/66871626/134791673-938a867b-2850-4f57-9de5-6733fca7847b.png)

![screenshot-pokbeon com-2019 11 04-16_56_57](https://user-images.githubusercontent.com/66871626/134791678-65f04013-973e-4949-8716-a5acabee9650.png)

![screenshot-pokbeon com-2019 11 04-16_57_59](https://user-images.githubusercontent.com/66871626/134791684-3eb26a5f-0d2c-4f5c-92c2-dd9ac90cf17b.png)

### 😍 Version

- Python 3.9.5

- Django 3.2.4

- PostgreSQL 13.3

### 🙏 Step 1. Django 설치

- Django 설치

  ```
  pip install Django==3.2.4
  ```

- Django REST framework 설치

  ```
  pip install djangorestframework
  ```

- PostgreSQL 연동

  ```
  pip install psycopg2
  ```

### 🖐 Step 2. Django 설정

- Secret Key 생성

  ```
  https://djecrety.ir/ 에서 Secret Key 생성
  ```

- 설정 파일 수정

  _aquarium-assets/mysite/settings.py_

  ```
  SECRET_KEY = 'Secret Key'
  ```

  ```
  DEBUG = True
  ```

  ```
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.postgresql',
          'NAME': 'DB 명',
          'USER': '아이디',
          'PASSWORD': '비밀번호',
          'HOST': '127.0.0.1',
          'PORT': '5432',
      }
  }
  ```

### 👜 Step 3. PostgreSQL DB 생성

- DB 생성

  ```
  create database [DB 명]
  ```

### 👍 Step 4. Django 실행

- Super User 생성

  ```
  python manage.py createsuperuser
  ```

- DB 마이그레이션

  ```
  python manage.py makemigrations
  python manage.py migrate
  ```

- Django 실행

  ```
  python manage.py runserver 0.0.0.0:8000
  ```
