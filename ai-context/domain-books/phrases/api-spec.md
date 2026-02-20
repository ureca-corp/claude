# phrases 도메인 API 명세

> 생성일: 2026-02-12
> Phase: 4 (API Designer)
> 상태: ✅ 완료

---

## 📋 ENUM 정의

### MissionType

미션 타입 (missions 도메인과 동일):
- `taxi`: 택시 이용 미션
- `payment`: 결제 미션
- `checkin`: 체크인 미션

### PhraseCategory

추천 문장 카테고리:
- `greeting`: 인사
- `request`: 요청
- `question`: 질문
- `response`: 응답
- `emergency`: 긴급

---

## 📡 API 목록

| API | 설명 | 중요도 |
|-----|------|:------:|
| 미션 타입별 추천 문장 조회 | 택시/결제/체크인 추천 문장 목록 | 🔥 필수 |

**참고**: 추천 문장 생성/수정/삭제는 관리자 전용 API입니다. 사용자는 조회만 가능합니다.

---

## 1. 미션 타입별 추천 문장 조회

### 개요

**목적**: 사용자가 미션 진행 시 해당 미션 타입의 추천 문장 목록 제공

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 유효한 미션 타입 (택시/결제/체크인)
- 해당 타입의 추천 문장이 3-5개 이상 존재

---

### Request (요청)

**URL**: `/phrases?missionType={missionType}`

**Headers**:
```
Authorization: Bearer {authToken}
```

**Query Parameters**:

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| missionType | **MissionType** (ENUM) | ✅ | 미션 타입 | "taxi", "payment", "checkin" |

**예시**:
```
GET /phrases?missionType=taxi
GET /phrases?missionType=payment
```

---

### Response (응답)

#### 성공 (200 OK)

**택시 미션**:
```json
{
  "status": "SUCCESS",
  "message": "추천 문장을 조회했습니다",
  "data": {
    "missionType": "taxi",
    "phrases": [
      {
        "id": "p_abc123",
        "koreanText": "여기서 내려주세요",
        "englishText": "Please drop me off here",
        "category": "request",
        "audioUrl": "https://storage.cloud.com/phrase_abc123.mp3"
      },
      {
        "id": "p_def456",
        "koreanText": "얼마예요?",
        "englishText": "How much is it?",
        "category": "question",
        "audioUrl": "https://storage.cloud.com/phrase_def456.mp3"
      },
      {
        "id": "p_ghi789",
        "koreanText": "영수증 주세요",
        "englishText": "Receipt, please",
        "category": "request",
        "audioUrl": "https://storage.cloud.com/phrase_ghi789.mp3"
      }
    ],
    "total": 3
  }
}
```

**결제 미션**:
```json
{
  "status": "SUCCESS",
  "message": "추천 문장을 조회했습니다",
  "data": {
    "missionType": "payment",
    "phrases": [
      {
        "id": "p_jkl012",
        "koreanText": "카드 되나요?",
        "englishText": "Do you accept cards?",
        "category": "question",
        "audioUrl": "https://storage.cloud.com/phrase_jkl012.mp3"
      },
      {
        "id": "p_mno345",
        "koreanText": "현금으로 할게요",
        "englishText": "I'll pay with cash",
        "category": "request",
        "audioUrl": "https://storage.cloud.com/phrase_mno345.mp3"
      },
      {
        "id": "p_pqr678",
        "koreanText": "영수증 주세요",
        "englishText": "Receipt, please",
        "category": "request",
        "audioUrl": "https://storage.cloud.com/phrase_pqr678.mp3"
      }
    ],
    "total": 3
  }
}
```

**체크인 미션**:
```json
{
  "status": "SUCCESS",
  "message": "추천 문장을 조회했습니다",
  "data": {
    "missionType": "checkin",
    "phrases": [
      {
        "id": "p_stu901",
        "koreanText": "체크인하려고 하는데요",
        "englishText": "I'd like to check in",
        "category": "request",
        "audioUrl": "https://storage.cloud.com/phrase_stu901.mp3"
      },
      {
        "id": "p_vwx234",
        "koreanText": "예약 확인 부탁드려요",
        "englishText": "Can you confirm my reservation?",
        "category": "question",
        "audioUrl": "https://storage.cloud.com/phrase_vwx234.mp3"
      },
      {
        "id": "p_yz567",
        "koreanText": "방 열쇠 주세요",
        "englishText": "Room key, please",
        "category": "request",
        "audioUrl": "https://storage.cloud.com/phrase_yz567.mp3"
      }
    ],
    "total": 3
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

**잘못된 미션 타입**:
```json
{
  "status": "INVALID_INPUT",
  "message": "유효하지 않은 미션 타입입니다",
  "data": null
}
```

---

### 수도코드

```
Function 추천문장조회(missionType):
    # 1. ENUM 검증
    If missionType NOT IN [MissionType.taxi, MissionType.payment, MissionType.checkin]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 미션 타입입니다",
            data: null
        }

    # 2. 추천 문장 조회
    Phrases = Find All Phrases Where MissionType = missionType

    # 3. 응답
    Return {
        status: "SUCCESS",
        message: "추천 문장을 조회했습니다",
        data: {
            missionType: missionType,
            phrases: Phrases,
            total: Count(Phrases)
        }
    }
```

---

## 📝 추천 문장 사용 시나리오

### 사용자 흐름

1. **미션 시작**:
   - 사용자가 택시 미션 시작
   - 시스템이 택시용 추천 문장 3-5개 자동 조회

2. **추천 문장 카드 표시**:
   - 미션 화면 하단에 추천 문장 카드 목록 표시
   - 각 카드에 한국어/영어 텍스트 미리보기

3. **카드 선택**:
   - 사용자가 "여기서 내려주세요" 카드 선택
   - 전체 화면으로 확대되어 큰 글씨로 표시
   - 한국어(위) / 영어(아래) 동시 표시

4. **음성 재생**:
   - "읽어주기" 버튼 → audioUrl 재생
   - 미리 생성된 TTS 음성으로 빠른 응답

5. **복사 기능**:
   - "복사" 버튼 → 클립보드에 텍스트 복사
   - 다른 앱에 붙여넣기 가능

---

## 📝 주요 제약

### 조회 전용

**규칙**: 일반 사용자는 추천 문장을 조회만 가능합니다.

- 생성/수정/삭제는 관리자 전용 API
- 사용자는 미리 준비된 템플릿만 사용

### 미리 생성된 음성

**규칙**: 추천 문장의 음성은 미리 TTS로 생성되어 저장됩니다.

- 실시간 TTS 호출 없음 (빠른 응답)
- audioUrl이 null인 경우 클라이언트에서 TTS 호출

### 다국어 확장

**규칙**: 한국어/영어는 DB에 미리 저장되어 있습니다.

- 향후 일본어/중국어 추가 시 새 필드 추가 (JapaneseText, ChineseText)
- 또는 별도 Translation 테이블 연결

### Translation 기록 없음

**규칙**: 추천 문장 사용은 Translation 기록을 생성하지 않습니다.

- 사용자가 직접 입력/녹음한 번역만 기록
- 추천 문장은 템플릿이므로 기록 불필요
- 필요 시 별도 PhraseUsageLog 테이블 생성 가능

---

## 🔧 관리자 전용 API (참고)

### 추천 문장 생성

**URL**: `POST /admin/phrases`

**Request**:
```json
{
  "missionType": "taxi",
  "koreanText": "여기서 내려주세요",
  "englishText": "Please drop me off here",
  "category": "request"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "추천 문장이 생성되었습니다",
  "data": {
    "id": "p_abc123",
    "missionType": "taxi",
    "koreanText": "여기서 내려주세요",
    "englishText": "Please drop me off here",
    "category": "request",
    "audioUrl": "https://storage.cloud.com/phrase_abc123.mp3"
  }
}
```

**프로세스**:
1. 관리자가 새 추천 문장 입력
2. 시스템이 TTS API로 음성 생성 (한국어/영어 각각)
3. 음성 파일을 Cloud Storage에 업로드
4. Phrase 엔티티 저장

### 추천 문장 수정

**URL**: `PUT /admin/phrases/{phraseId}`

### 추천 문장 삭제

**URL**: `DELETE /admin/phrases/{phraseId}`

---

**phrases 도메인 API 완료** ✅
