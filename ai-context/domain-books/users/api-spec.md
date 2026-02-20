# users 도메인 API 명세

> 생성일: 2026-02-12
> Phase: 4 (API Designer)
> 상태: ✅ 완료

---

## 📋 ENUM 정의

### SocialProvider

소셜 로그인 제공자:
- `google`: Google 소셜 로그인
- `apple`: Apple 소셜 로그인

### PreferredLanguage

사용자 선호 언어:
- `ko`: 한국어
- `en`: 영어

### UserStatus

사용자 계정 상태:
- `Active`: 활성 상태
- `Deleted`: 탈퇴 (Soft Delete)

---

## 📡 API 목록

| API | 설명 | 중요도 |
|-----|------|:------:|
| 소셜 로그인 | Google/Apple 로그인 | 🔥 필수 |
| 프로필 조회 | 사용자 정보 조회 | ⭐ 중요 |
| 프로필 수정 | 사용자 정보 변경 | ⭐ 중요 |
| 회원 탈퇴 | 사용자 Soft Delete | ⭐ 중요 |

---

## 1. 소셜 로그인

### 개요

**목적**: Google 또는 Apple 소셜 로그인으로 회원가입/로그인 처리

**호출 주체**: 비회원 (인증 불필요)

**성공 조건**:
- 유효한 소셜 로그인 토큰
- 첫 로그인 시 자동 회원가입
- 이미 가입된 경우 로그인 처리

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| provider | **SocialProvider** (ENUM) | ✅ | 소셜 로그인 제공자 | "google", "apple" |
| token | 문자열 | ✅ | 소셜 로그인 인증 토큰 | "eyJhbGc..." |

**예시**:
```json
{
  "provider": "google",
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

---

### Response (응답)

#### 성공 (200 OK)

**표준 Response 형식**:
```json
{
  "status": "SUCCESS",
  "message": "로그인 성공",
  "data": {
    "user": {
      "id": "u_abc123",
      "email": "john@gmail.com",
      "displayName": "John Doe",
      "profileImage": "https://lh3.googleusercontent.com/...",
      "preferredLanguage": "en",
      "status": "Active"
    },
    "isNewUser": true,
    "authToken": "jwt_token_here"
  }
}
```

#### 실패 (400 Bad Request)

**잘못된 토큰**:
```json
{
  "status": "INVALID_TOKEN",
  "message": "유효하지 않은 소셜 로그인 토큰입니다",
  "data": null
}
```

**잘못된 제공자**:
```json
{
  "status": "INVALID_PROVIDER",
  "message": "지원하지 않는 소셜 제공자입니다",
  "data": null
}
```

**제공자 API 오류**:
```json
{
  "status": "PROVIDER_ERROR",
  "message": "소셜 제공자 API 호출에 실패했습니다",
  "data": null
}
```

---

### 수도코드

```
Function 소셜로그인(provider, token):
    # 1. ENUM 검증
    If provider NOT IN [SocialProvider.google, SocialProvider.apple]:
        Return {
            status: "INVALID_PROVIDER",
            message: "지원하지 않는 소셜 제공자입니다",
            data: null
        }

    # 2. 소셜 제공자에서 사용자 정보 조회
    소셜_사용자_정보 = Call 소셜_API(provider, token)
    If 소셜_사용자_정보 is Null:
        Return {
            status: "INVALID_TOKEN",
            message: "유효하지 않은 소셜 로그인 토큰입니다",
            data: null
        }

    Email = 소셜_사용자_정보.email

    # 3. 기존 사용자 확인
    User = Find User Where Email = Email AND Status = "Active"

    If User Exists:
        # 기존 사용자 로그인
        AuthToken = Generate_JWT(User.ID)
        Return {
            status: "SUCCESS",
            message: "로그인 성공",
            data: {
                user: User,
                isNewUser: false,
                authToken: AuthToken
            }
        }
    Else:
        # 신규 사용자 생성
        NewUser = Create User {
            email: Email,
            displayName: 소셜_사용자_정보.name,
            profileImage: 소셜_사용자_정보.picture,
            preferredLanguage: "en",  # 기본값
            status: "Active"
        }
        AuthToken = Generate_JWT(NewUser.ID)
        Return {
            status: "SUCCESS",
            message: "회원가입 및 로그인 성공",
            data: {
                user: NewUser,
                isNewUser: true,
                authToken: AuthToken
            }
        }
```

---

## 2. 프로필 조회

### 개요

**목적**: 로그인한 사용자의 프로필 정보 조회

**호출 주체**: 인증된 사용자

**성공 조건**: 유효한 인증 토큰

---

### Request (요청)

**URL**: `/users/me`

**Headers**:
```
Authorization: Bearer {authToken}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "프로필 조회 성공",
  "data": {
    "id": "u_abc123",
    "email": "john@gmail.com",
    "displayName": "여행러버",
    "profileImage": "https://...",
    "preferredLanguage": "ko",
    "status": "Active",
    "createdAt": "2026-02-12T10:30:00Z"
  }
}
```

#### 실패 (401 Unauthorized)

```json
{
  "status": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "data": null
}
```

---

## 3. 프로필 수정

### 개요

**목적**: 로그인한 사용자의 프로필 정보 수정

**호출 주체**: 인증된 사용자 (본인만)

**성공 조건**:
- 유효한 인증 토큰
- 본인의 프로필만 수정 가능
- 수정 가능 필드: displayName, profileImage, preferredLanguage

---

### Request (요청)

**URL**: `/users/me`

**Headers**:
```
Authorization: Bearer {authToken}
```

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| displayName | 문자열 | ❌ | 표시 이름 | "새닉네임" |
| profileImage | 문자열 (URL) | ❌ | 프로필 사진 URL | "https://..." |
| preferredLanguage | **PreferredLanguage** (ENUM) | ❌ | 선호 언어 | "ko", "en" |

**예시**:
```json
{
  "displayName": "새닉네임",
  "preferredLanguage": "ko"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "프로필 수정 성공",
  "data": {
    "id": "u_abc123",
    "email": "john@gmail.com",
    "displayName": "새닉네임",
    "profileImage": "https://...",
    "preferredLanguage": "ko",
    "status": "Active",
    "createdAt": "2026-02-12T10:30:00Z"
  }
}
```

#### 실패 (401 Unauthorized)

**인증 실패**:
```json
{
  "status": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "data": null
}
```

#### 실패 (400 Bad Request)

**권한 없음**:
```json
{
  "status": "FORBIDDEN",
  "message": "본인의 프로필만 수정할 수 있습니다",
  "data": null
}
```

**잘못된 입력**:
```json
{
  "status": "INVALID_INPUT",
  "message": "유효하지 않은 언어 코드입니다",
  "data": null
}
```

---

## 4. 회원 탈퇴

### 개요

**목적**: 사용자 Soft Delete (익명화)

**호출 주체**: 인증된 사용자 (본인만)

**성공 조건**: 유효한 인증 토큰

---

### Request (요청)

**URL**: `/users/me`

**Method**: DELETE

**Headers**:
```
Authorization: Bearer {authToken}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "회원 탈퇴가 완료되었습니다",
  "data": null
}
```

#### 실패 (401 Unauthorized)

```json
{
  "status": "UNAUTHORIZED",
  "message": "인증이 필요합니다",
  "data": null
}
```

#### 실패 (400 Bad Request)

**사용자 없음**:
```json
{
  "status": "NOT_FOUND",
  "message": "사용자를 찾을 수 없습니다",
  "data": null
}
```

---

### 수도코드

```
Function 회원탈퇴(userID):
    # 1. 사용자 조회
    User = Find User Where ID = userID AND Status = "Active"
    If User is Null:
        Return {
            status: "NOT_FOUND",
            message: "사용자를 찾을 수 없습니다",
            data: null
        }

    # 2. Soft Delete
    User.Status = UserStatus.Deleted
    User.Email = "deleted_user_" + userID
    User.DisplayName = "탈퇴한 사용자"
    User.ProfileImage = Null
    Update User

    # 3. 관련 데이터 처리
    Delete All SearchHistory Where UserID = userID
    Delete All FavoritePlace Where UserID = userID

    # 번역/미션 기록은 익명으로 보관

    Return {
        status: "SUCCESS",
        message: "회원 탈퇴가 완료되었습니다",
        data: null
    }
```

---

**users 도메인 API 완료** ✅
