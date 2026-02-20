# translations 도메인 API 명세

> 생성일: 2026-02-12
> Phase: 4 (API Designer)
> 상태: ✅ 완료

---

## 📋 ENUM 정의

### LanguageCode

언어 코드:
- `ko`: 한국어
- `en`: 영어
- `ja`: 일본어 (확장)
- `zh`: 중국어 (확장)

**참고**: PreferredLanguage ENUM은 users 도메인에서 정의되어 있습니다.

---

## 📡 API 목록

| API | 설명 | 중요도 |
|-----|------|:------:|
| 텍스트 번역 생성 | 텍스트 번역 및 저장 | 🔥 필수 |
| 음성 번역 생성 | 음성 → 텍스트 → 번역 | 🔥 필수 |
| 번역 기록 조회 | 사용자의 번역 기록 목록 | ⭐ 중요 |

---

## 1. 텍스트 번역 생성

### 개요

**목적**: 사용자가 입력한 텍스트를 번역하고 서버에 저장

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 원문 텍스트 입력
- 번역 결과를 영구 저장

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| sourceText | 문자열 | ✅ | 번역할 원문 텍스트 | "안녕하세요" |
| sourceLanguage | **LanguageCode** (ENUM) | ✅ | 원문 언어 코드 | "ko" |
| targetLanguage | **LanguageCode** (ENUM) | ✅ | 번역할 언어 코드 | "en" |
| missionId | 문자열 | ❌ | 미션 진행 중이면 미션 ID | "m_abc123" |

**예시**:
```json
{
  "sourceText": "안녕하세요",
  "sourceLanguage": "ko",
  "targetLanguage": "en",
  "missionId": null
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "번역이 완료되었습니다",
  "data": {
    "id": "t_abc123",
    "sourceText": "안녕하세요",
    "targetText": "Hello",
    "audioFileUrl": null,
    "createdAt": "2026-02-12T14:30:00Z"
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

#### 실패 (400 Bad Request)

**잘못된 입력**:
```json
{
  "status": "INVALID_INPUT",
  "message": "유효하지 않은 언어 코드입니다",
  "data": null
}
```

**번역 서비스 오류**:
```json
{
  "status": "TRANSLATION_ERROR",
  "message": "번역 서비스 오류가 발생했습니다",
  "data": null
}
```

---

### 수도코드

```
Function 텍스트번역생성(userID, sourceText, sourceLanguage, targetLanguage, missionId):
    # 1. ENUM 검증
    If sourceLanguage NOT IN [LanguageCode.ko, LanguageCode.en, LanguageCode.ja, LanguageCode.zh]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 언어 코드입니다",
            data: null
        }

    If targetLanguage NOT IN [LanguageCode.ko, LanguageCode.en, LanguageCode.ja, LanguageCode.zh]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 언어 코드입니다",
            data: null
        }

    # 2. 번역 API 호출
    targetText = Call 번역_API(sourceText, sourceLanguage, targetLanguage)
    If targetText is Null:
        Return {
            status: "TRANSLATION_ERROR",
            message: "번역 서비스 오류가 발생했습니다",
            data: null
        }

    # 3. Translation 엔티티 생성
    Translation = Create Translation {
        userID: userID,
        sourceText: sourceText,
        targetText: targetText,
        audioFileUrl: null,
        missionId: missionId,
        createdAt: Now()
    }

    # 4. 저장 및 응답
    Save Translation
    Return {
        status: "SUCCESS",
        message: "번역이 완료되었습니다",
        data: Translation
    }
```

---

## 2. 음성 번역 생성

### 개요

**목적**: 사용자가 녹음한 음성을 텍스트로 변환하고 번역한 후 서버에 저장

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 음성 파일 (Base64 인코딩 또는 파일 업로드)
- STT → 번역 → 음성 파일 저장

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| audioFile | 문자열 (Base64) | ✅ | 녹음된 음성 파일 | "data:audio/wav;base64,UklGRi..." |
| sourceLanguage | **LanguageCode** (ENUM) | ✅ | 원문 언어 코드 | "ko" |
| targetLanguage | **LanguageCode** (ENUM) | ✅ | 번역할 언어 코드 | "en" |
| missionId | 문자열 | ❌ | 미션 진행 중이면 미션 ID | "m_abc123" |

**예시**:
```json
{
  "audioFile": "data:audio/wav;base64,UklGRiQAAABXQVZF...",
  "sourceLanguage": "ko",
  "targetLanguage": "en",
  "missionId": "m_abc123"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "음성 번역이 완료되었습니다",
  "data": {
    "id": "t_xyz789",
    "sourceText": "여기서 내려주세요",
    "targetText": "Please drop me off here",
    "audioFileUrl": "https://storage.cloud.com/audio_xyz789.wav",
    "createdAt": "2026-02-12T14:35:00Z"
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

#### 실패 (400 Bad Request)

**STT 실패**:
```json
{
  "status": "STT_ERROR",
  "message": "음성을 인식할 수 없습니다. 다시 시도해주세요.",
  "data": null
}
```

**번역 실패**:
```json
{
  "status": "TRANSLATION_ERROR",
  "message": "번역 서비스 오류가 발생했습니다",
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

### 수도코드

```
Function 음성번역생성(userID, audioFile, sourceLanguage, targetLanguage, missionId):
    # 1. ENUM 검증
    If sourceLanguage NOT IN [LanguageCode.ko, LanguageCode.en, LanguageCode.ja, LanguageCode.zh]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 언어 코드입니다",
            data: null
        }

    If targetLanguage NOT IN [LanguageCode.ko, LanguageCode.en, LanguageCode.ja, LanguageCode.zh]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 언어 코드입니다",
            data: null
        }

    # 2. 음성 파일을 임시 저장소에 업로드
    tempAudioUrl = Upload_To_Storage(audioFile)

    # 3. STT API 호출 (음성 → 텍스트)
    sourceText = Call STT_API(tempAudioUrl, sourceLanguage)
    If sourceText is Null:
        Return {
            status: "STT_ERROR",
            message: "음성을 인식할 수 없습니다. 다시 시도해주세요.",
            data: null
        }

    # 4. 번역 API 호출
    targetText = Call 번역_API(sourceText, sourceLanguage, targetLanguage)
    If targetText is Null:
        Return {
            status: "TRANSLATION_ERROR",
            message: "번역 서비스 오류가 발생했습니다",
            data: null
        }

    # 5. 음성 파일을 영구 저장소로 이동
    audioFileUrl = Move_To_Permanent_Storage(tempAudioUrl)

    # 6. Translation 엔티티 생성
    Translation = Create Translation {
        userID: userID,
        sourceText: sourceText,
        targetText: targetText,
        audioFileUrl: audioFileUrl,
        missionId: missionId,
        createdAt: Now()
    }

    # 7. 저장 및 응답
    Save Translation
    Return {
        status: "SUCCESS",
        message: "음성 번역이 완료되었습니다",
        data: Translation
    }
```

**중요**: STT 실패 시 재시도는 사용자가 수동으로 진행합니다. 시스템은 자동 재시도를 하지 않습니다.

---

## 3. 번역 기록 조회

### 개요

**목적**: 사용자의 번역 기록 목록을 최신순으로 조회

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 본인의 번역 기록만 조회 가능
- 미션 필터링 가능

---

### Request (요청)

**URL**: `/translations?missionId={missionId}&limit={limit}&offset={offset}`

**Headers**:
```
Authorization: Bearer {authToken}
```

**Query Parameters**:

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| missionId | 문자열 | ❌ | 특정 미션의 번역만 조회 | "m_abc123" |
| limit | 숫자 | ❌ | 한 번에 가져올 개수 (기본 20) | 20 |
| offset | 숫자 | ❌ | 시작 위치 (페이징용) | 0 |

**예시**:
```
GET /translations?limit=20&offset=0
GET /translations?missionId=m_abc123
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "번역 기록을 조회했습니다",
  "data": {
    "translations": [
      {
        "id": "t_xyz789",
        "sourceText": "여기서 내려주세요",
        "targetText": "Please drop me off here",
        "audioFileUrl": "https://storage.cloud.com/audio_xyz789.wav",
        "missionId": "m_abc123",
        "createdAt": "2026-02-12T14:35:00Z"
      },
      {
        "id": "t_abc456",
        "sourceText": "안녕하세요",
        "targetText": "Hello",
        "audioFileUrl": null,
        "missionId": null,
        "createdAt": "2026-02-12T14:30:00Z"
      }
    ],
    "total": 2,
    "limit": 20,
    "offset": 0
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

### 수도코드

```
Function 번역기록조회(userID, missionId, limit, offset):
    # 1. 기본 쿼리 설정
    Query = Select * From Translation Where UserID = userID

    # 2. 미션 필터링 (선택)
    If missionId is Not Null:
        Query = Query AND MissionID = missionId

    # 3. 정렬 및 페이징
    Query = Query Order By CreatedAt DESC
    Query = Query Limit limit Offset offset

    # 4. 결과 조회
    Translations = Execute Query
    Total = Count All Translations For UserID

    # 5. 응답
    Return {
        status: "SUCCESS",
        message: "번역 기록을 조회했습니다",
        data: {
            translations: Translations,
            total: Total,
            limit: limit,
            offset: offset
        }
    }
```

---

## 📝 주요 제약

### 번역 기록 불변성

**규칙**: 번역 기록은 생성 후 수정 또는 삭제할 수 없습니다. (Immutable)

- 사용자는 조회만 가능
- 관리자도 수정 불가 (감사 추적용)
- 사용자 탈퇴 시 익명화되어 보관

### 음성 파일 저장

**규칙**: 음성 파일은 Cloud Storage에 저장하고 URL만 DB에 보관합니다.

- 저장 형식: WAV 또는 MP3
- URL 만료 정책: 없음 (영구 저장)
- 사용자 탈퇴 시 익명화되지만 파일은 유지

---

**translations 도메인 API 완료** ✅
