# missions 도메인 API 명세

> 생성일: 2026-02-12
> Phase: 4 (API Designer)
> 상태: ✅ 완료

---

## 📋 ENUM 정의

### MissionType

미션 타입:
- `taxi`: 택시 이용 미션
- `payment`: 결제 미션
- `checkin`: 체크인 미션

### MissionStatus

미션 상태:
- `InProgress`: 진행중
- `Completed`: 완료
- `Cancelled`: 취소

### MissionResult

미션 완료 결과:
- `Resolved`: 해결
- `PartiallyResolved`: 부분해결
- `Unresolved`: 미해결

### StepDirection

단계 이동 방향:
- `next`: 다음 단계
- `prev`: 이전 단계

---

## 📡 API 목록

| API | 설명 | 중요도 |
|-----|------|:------:|
| 미션 시작 | 새 미션 생성 및 단계 초기화 | 🔥 필수 |
| 미션 단계 변경 | 현재 단계 이동 (다음/이전) | 🔥 필수 |
| 미션 완료 | 미션 종료 및 결과 저장 | 🔥 필수 |
| 진행중 미션 조회 | 현재 진행중인 미션 정보 | ⭐ 중요 |

---

## 1. 미션 시작

### 개요

**목적**: 사용자가 미션 카드(택시/결제/체크인)를 선택하여 새 미션 시작

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 현재 진행중인 미션이 없어야 함
- 미션 타입이 유효해야 함 (택시/결제/체크인)

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| type | **MissionType** (ENUM) | ✅ | 미션 타입 | "taxi", "payment", "checkin" |

**예시**:
```json
{
  "type": "taxi"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "미션이 시작되었습니다",
  "data": {
    "mission": {
      "id": "m_abc123",
      "type": "taxi",
      "status": "InProgress",
      "currentStep": 1,
      "result": null,
      "createdAt": "2026-02-12T14:30:00Z"
    },
    "steps": [
      {
        "stepNumber": 1,
        "title": "목적지 설정",
        "description": "가고 싶은 장소를 검색하거나 즐겨찾기에서 선택하세요"
      },
      {
        "stepNumber": 2,
        "title": "택시 호출",
        "description": "택시 앱을 사용하거나 길거리에서 택시를 잡으세요"
      },
      {
        "stepNumber": 3,
        "title": "운전자에게 목적지 전달",
        "description": "추천 문장을 사용하거나 번역 기능으로 목적지를 전달하세요"
      }
    ]
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

**진행중인 미션이 있는 경우**:
```json
{
  "status": "MISSION_IN_PROGRESS",
  "message": "이미 진행중인 미션이 있습니다. 먼저 완료해주세요.",
  "data": {
    "currentMission": {
      "id": "m_xyz789",
      "type": "payment",
      "currentStep": 2
    }
  }
}
```

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
Function 미션시작(userID, type):
    # 1. ENUM 검증
    If type NOT IN [MissionType.taxi, MissionType.payment, MissionType.checkin]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 미션 타입입니다",
            data: null
        }

    # 2. 진행중인 미션 확인
    ExistingMission = Find Mission Where UserID = userID AND Status = MissionStatus.InProgress
    If ExistingMission Exists:
        Return {
            status: "MISSION_IN_PROGRESS",
            message: "이미 진행중인 미션이 있습니다. 먼저 완료해주세요.",
            data: {
                currentMission: ExistingMission
            }
        }

    # 3. 새 Mission 생성
    Mission = Create Mission {
        userID: userID,
        type: type,
        status: MissionStatus.InProgress,
        currentStep: 1,
        result: null,
        createdAt: Now()
    }
    Save Mission

    # 4. 미션 타입에 맞는 Step 엔티티 생성
    Steps = Get_Steps_Template(type)  # 미션 타입별 3-7개 단계 템플릿
    For Each StepTemplate In Steps:
        Step = Create Step {
            missionID: Mission.ID,
            stepNumber: StepTemplate.Number,
            title: StepTemplate.Title,
            description: StepTemplate.Description
        }
        Save Step

    # 5. 응답
    Return {
        status: "SUCCESS",
        message: "미션이 시작되었습니다",
        data: {
            mission: Mission,
            steps: Steps
        }
    }
```

---

## 2. 미션 단계 변경

### 개요

**목적**: 미션의 현재 단계를 다음 또는 이전으로 이동

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 진행중인 미션이 존재
- 단계 번호가 유효 범위 내 (1 ~ 마지막 단계)

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| missionId | 문자열 | ✅ | 미션 ID | "m_abc123" |
| direction | **StepDirection** (ENUM) | ✅ | 이동 방향 | "next", "prev" |

**예시**:
```json
{
  "missionId": "m_abc123",
  "direction": "next"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "단계가 변경되었습니다",
  "data": {
    "mission": {
      "id": "m_abc123",
      "type": "taxi",
      "status": "InProgress",
      "currentStep": 2,
      "result": null
    },
    "currentStepInfo": {
      "stepNumber": 2,
      "title": "택시 호출",
      "description": "택시 앱을 사용하거나 길거리에서 택시를 잡으세요"
    }
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

**범위 초과**:
```json
{
  "status": "INVALID_STEP",
  "message": "유효하지 않은 단계입니다",
  "data": null
}
```

**미션 없음**:
```json
{
  "status": "NOT_FOUND",
  "message": "진행중인 미션을 찾을 수 없습니다",
  "data": null
}
```

**잘못된 방향**:
```json
{
  "status": "INVALID_INPUT",
  "message": "유효하지 않은 방향입니다",
  "data": null
}
```

---

### 수도코드

```
Function 미션단계변경(userID, missionId, direction):
    # 1. ENUM 검증
    If direction NOT IN [StepDirection.next, StepDirection.prev]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 방향입니다",
            data: null
        }

    # 2. 미션 조회
    Mission = Find Mission Where ID = missionId AND UserID = userID AND Status = MissionStatus.InProgress
    If Mission is Null:
        Return {
            status: "NOT_FOUND",
            message: "진행중인 미션을 찾을 수 없습니다",
            data: null
        }

    # 3. 새 단계 계산
    If direction = StepDirection.next:
        NewStep = Mission.CurrentStep + 1
    Else If direction = StepDirection.prev:
        NewStep = Mission.CurrentStep - 1

    # 4. 단계 범위 검증
    TotalSteps = Count Steps Where MissionID = missionId
    If NewStep < 1 OR NewStep > TotalSteps:
        Return {
            status: "INVALID_STEP",
            message: "유효하지 않은 단계입니다",
            data: null
        }

    # 5. 단계 업데이트
    Mission.CurrentStep = NewStep
    Update Mission

    # 6. 현재 단계 정보 조회
    CurrentStepInfo = Find Step Where MissionID = missionId AND StepNumber = NewStep

    # 7. 응답
    Return {
        status: "SUCCESS",
        message: "단계가 변경되었습니다",
        data: {
            mission: Mission,
            currentStepInfo: CurrentStepInfo
        }
    }
```

---

## 3. 미션 완료

### 개요

**목적**: 사용자가 미션을 종료하고 결과를 선택

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 진행중인 미션이 존재
- 유효한 결과 타입 (해결/부분해결/미해결)

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| missionId | 문자열 | ✅ | 미션 ID | "m_abc123" |
| result | **MissionResult** (ENUM) | ✅ | 완료 결과 | "Resolved", "PartiallyResolved", "Unresolved" |

**예시**:
```json
{
  "missionId": "m_abc123",
  "result": "Resolved"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "미션이 완료되었습니다",
  "data": {
    "mission": {
      "id": "m_abc123",
      "type": "taxi",
      "status": "Completed",
      "currentStep": 3,
      "result": "Resolved",
      "completedAt": "2026-02-12T15:00:00Z"
    }
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

**미션 없음**:
```json
{
  "status": "NOT_FOUND",
  "message": "진행중인 미션을 찾을 수 없습니다",
  "data": null
}
```

**잘못된 결과**:
```json
{
  "status": "INVALID_INPUT",
  "message": "유효하지 않은 완료 결과입니다",
  "data": null
}
```

---

### 수도코드

```
Function 미션완료(userID, missionId, result):
    # 1. ENUM 검증
    If result NOT IN [MissionResult.Resolved, MissionResult.PartiallyResolved, MissionResult.Unresolved]:
        Return {
            status: "INVALID_INPUT",
            message: "유효하지 않은 완료 결과입니다",
            data: null
        }

    # 2. 미션 조회
    Mission = Find Mission Where ID = missionId AND UserID = userID AND Status = MissionStatus.InProgress
    If Mission is Null:
        Return {
            status: "NOT_FOUND",
            message: "진행중인 미션을 찾을 수 없습니다",
            data: null
        }

    # 3. 미션 상태 업데이트
    Mission.Status = MissionStatus.Completed
    Mission.Result = result
    Mission.CompletedAt = Now()
    Update Mission

    # 4. 응답
    Return {
        status: "SUCCESS",
        message: "미션이 완료되었습니다",
        data: {
            mission: Mission
        }
    }
```

---

## 4. 진행중 미션 조회

### 개요

**목적**: 사용자의 현재 진행중인 미션 정보 조회

**호출 주체**: 인증된 사용자

**성공 조건**: 유효한 인증 토큰

---

### Request (요청)

**URL**: `/missions/active`

**Headers**:
```
Authorization: Bearer {authToken}
```

---

### Response (응답)

#### 성공 (200 OK)

**진행중 미션이 있는 경우**:
```json
{
  "status": "SUCCESS",
  "message": "진행중인 미션을 조회했습니다",
  "data": {
    "mission": {
      "id": "m_abc123",
      "type": "taxi",
      "status": "InProgress",
      "currentStep": 2,
      "result": null,
      "createdAt": "2026-02-12T14:30:00Z"
    },
    "currentStepInfo": {
      "stepNumber": 2,
      "title": "택시 호출",
      "description": "택시 앱을 사용하거나 길거리에서 택시를 잡으세요"
    },
    "totalSteps": 3
  }
}
```

**진행중 미션이 없는 경우**:
```json
{
  "status": "SUCCESS",
  "message": "진행중인 미션이 없습니다",
  "data": {
    "mission": null
  }
}
```

---

### 수도코드

```
Function 진행중미션조회(userID):
    # 1. 진행중 미션 조회
    Mission = Find Mission Where UserID = userID AND Status = MissionStatus.InProgress

    # 2. 미션이 없으면 null 응답
    If Mission is Null:
        Return {
            status: "SUCCESS",
            message: "진행중인 미션이 없습니다",
            data: {
                mission: null
            }
        }

    # 3. 현재 단계 정보 조회
    CurrentStepInfo = Find Step Where MissionID = Mission.ID AND StepNumber = Mission.CurrentStep

    # 4. 전체 단계 수 조회
    TotalSteps = Count Steps Where MissionID = Mission.ID

    # 5. 응답
    Return {
        status: "SUCCESS",
        message: "진행중인 미션을 조회했습니다",
        data: {
            mission: Mission,
            currentStepInfo: CurrentStepInfo,
            totalSteps: TotalSteps
        }
    }
```

---

## 📝 주요 제약

### 동시 진행 제약

**규칙**: 사용자는 한 번에 하나의 미션만 "진행중" 상태로 가질 수 있습니다.

- 새 미션 시작 전 이전 미션을 완료해야 함
- 미션 완료/취소 없이는 새 미션 시작 불가

### 서버 동기화

**규칙**: 미션 상태는 실시간으로 서버에 동기화됩니다.

- 단계 변경 즉시 서버 업데이트
- 여러 기기에서 미션 이어하기 가능
- 오프라인 시 큐에 쌓아두고 온라인 시 동기화

### 미션 타입 확장

**규칙**: 초기 3종(택시/결제/체크인) 외 추가 가능합니다.

- 미션 타입은 하드코딩이 아닌 DB 관리
- 향후 "음식주문", "쇼핑", "병원" 등 추가 가능

---

**missions 도메인 API 완료** ✅
