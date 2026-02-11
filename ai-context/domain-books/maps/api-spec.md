# maps 도메인 API 명세

> 생성일: 2026-02-12
> Phase: 4 (API Designer)
> 상태: ✅ 완료

---

## 📋 ENUM 정의

### LocationType

위치 타입:
- `CURRENT_LOCATION`: 현재 위치 (GPS)
- `ADDRESS`: 주소 입력
- `PLACE_NAME`: 장소명 입력

**참고**: 이 도메인은 주로 지리 데이터를 다루므로 최소한의 ENUM만 정의합니다.

---

## 📡 API 목록

| API | 설명 | 중요도 |
|-----|------|:------:|
| 경로 생성 | 출발지→목적지 경로 검색 및 저장 | 🔥 필수 |
| 즐겨찾기 추가 | 장소를 즐겨찾기에 저장 | ⭐ 중요 |
| 즐겨찾기 조회 | 사용자의 즐겨찾기 목록 | ⭐ 중요 |
| 즐겨찾기 삭제 | 즐겨찾기 장소 제거 | ⭐ 중요 |
| 검색 기록 조회 | 최근 검색한 장소 목록 | ⭐ 중요 |

---

## 1. 경로 생성

### 개요

**목적**: 출발지와 목적지를 입력받아 경로를 검색하고 서버에 저장

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 출발지/목적지 좌표 또는 주소
- 네이버 지도 API 성공 호출

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| origin | 문자열 | ✅ | 출발지 (주소 또는 "현재 위치") | "서울역" 또는 "CURRENT_LOCATION" |
| destination | 문자열 | ✅ | 목적지 (주소) | "명동" |
| missionId | 문자열 | ❌ | 미션 진행 중이면 미션 ID | "m_abc123" |

**예시**:
```json
{
  "origin": "CURRENT_LOCATION",
  "destination": "명동",
  "missionId": "m_abc123"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "경로가 생성되었습니다",
  "data": {
    "route": {
      "id": "r_abc123",
      "origin": {
        "name": "현재 위치",
        "address": "서울특별시 중구 세종대로 18",
        "latitude": 37.5665,
        "longitude": 126.9780
      },
      "destination": {
        "name": "명동",
        "address": "서울특별시 중구 명동2가",
        "latitude": 37.5636,
        "longitude": 126.9864
      },
      "summary": {
        "distance": "1.2km",
        "duration": "5분",
        "taxiFare": "4,000원"
      },
      "missionId": "m_abc123",
      "createdAt": "2026-02-12T14:30:00Z"
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

**지도 API 호출 실패**:
```json
{
  "status": "ROUTE_NOT_FOUND",
  "message": "경로를 찾을 수 없습니다. 주소를 확인해주세요.",
  "data": null
}
```

**잘못된 입력**:
```json
{
  "status": "INVALID_INPUT",
  "message": "출발지 또는 목적지가 유효하지 않습니다",
  "data": null
}
```

---

### 수도코드

```
Function 경로생성(userID, origin, destination, missionId):
    # 1. 출발지 좌표 해석
    If origin = LocationType.CURRENT_LOCATION:
        OriginCoords = Get_User_Location()  # 클라이언트에서 전달받은 GPS 좌표
    Else:
        OriginCoords = Call 지오코딩_API(origin)  # 주소 → 좌표 변환

    # 2. 목적지 좌표 해석
    DestinationCoords = Call 지오코딩_API(destination)

    # 3. 네이버 지도 API 호출 (서버 프록시)
    RouteData = Call 네이버_지도_API(OriginCoords, DestinationCoords)
    If RouteData is Null:
        Return {
            status: "ROUTE_NOT_FOUND",
            message: "경로를 찾을 수 없습니다. 주소를 확인해주세요.",
            data: null
        }

    # 4. 경로 요약 정보 추출
    Summary = {
        distance: RouteData.distance + "km",
        duration: RouteData.duration + "분",
        taxiFare: Calculate_Taxi_Fare(RouteData.distance)
    }

    # 5. Route 엔티티 생성
    Route = Create Route {
        origin: {
            name: origin,
            address: OriginCoords.address,
            latitude: OriginCoords.lat,
            longitude: OriginCoords.lng
        },
        destination: {
            name: destination,
            address: DestinationCoords.address,
            latitude: DestinationCoords.lat,
            longitude: DestinationCoords.lng
        },
        summary: Summary,
        missionId: missionId,
        createdAt: Now()
    }
    Save Route

    # 6. 검색 기록 저장
    Save_Search_History(userID, destination)

    # 7. 응답
    Return {
        status: "SUCCESS",
        message: "경로가 생성되었습니다",
        data: {
            route: Route
        }
    }
```

**참고**: 택시 요금은 기본요금 + 거리/시간 요금을 간단히 계산합니다. (정확한 요금은 택시 앱 참조)

---

## 2. 즐겨찾기 추가

### 개요

**목적**: 사용자가 자주 가는 장소를 즐겨찾기에 저장

**호출 주체**: 인증된 사용자

**성공 조건**:
- 유효한 인증 토큰
- 장소 이름/주소
- 즐겨찾기 최대 20개 제한

---

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|:----:|------|------|
| placeName | 문자열 | ✅ | 장소 이름 | "명동" |
| address | 문자열 | ✅ | 주소 | "서울특별시 중구 명동2가" |
| nickname | 문자열 | ✅ | 사용자 지정 별칭 | "숙소", "공항", "회사" |

**예시**:
```json
{
  "placeName": "명동",
  "address": "서울특별시 중구 명동2가",
  "nickname": "숙소"
}
```

---

### Response (응답)

#### 성공 (200 OK)

```json
{
  "status": "SUCCESS",
  "message": "즐겨찾기가 추가되었습니다",
  "data": {
    "favoritePlace": {
      "id": "fp_abc123",
      "placeName": "명동",
      "address": "서울특별시 중구 명동2가",
      "nickname": "숙소",
      "latitude": 37.5636,
      "longitude": 126.9864,
      "createdAt": "2026-02-12T14:30:00Z"
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

**즐겨찾기 최대 개수 초과**:
```json
{
  "status": "LIMIT_EXCEEDED",
  "message": "즐겨찾기는 최대 20개까지 저장할 수 있습니다",
  "data": null
}
```

**잘못된 입력**:
```json
{
  "status": "INVALID_INPUT",
  "message": "장소 이름 또는 주소가 유효하지 않습니다",
  "data": null
}
```

---

### 수도코드

```
Function 즐겨찾기추가(userID, placeName, address, nickname):
    # 1. 즐겨찾기 개수 확인
    FavoriteCount = Count FavoritePlace Where UserID = userID
    If FavoriteCount >= 20:
        Return {
            status: "LIMIT_EXCEEDED",
            message: "즐겨찾기는 최대 20개까지 저장할 수 있습니다",
            data: null
        }

    # 2. 주소 → 좌표 변환
    Coords = Call 지오코딩_API(address)

    # 3. FavoritePlace 엔티티 생성
    FavoritePlace = Create FavoritePlace {
        userID: userID,
        placeName: placeName,
        address: address,
        nickname: nickname,
        latitude: Coords.lat,
        longitude: Coords.lng,
        createdAt: Now()
    }
    Save FavoritePlace

    # 4. 응답
    Return {
        status: "SUCCESS",
        message: "즐겨찾기가 추가되었습니다",
        data: {
            favoritePlace: FavoritePlace
        }
    }
```

---

## 3. 즐겨찾기 조회

### 개요

**목적**: 사용자의 즐겨찾기 장소 목록 조회

**호출 주체**: 인증된 사용자

**성공 조건**: 유효한 인증 토큰

---

### Request (요청)

**URL**: `/maps/favorites`

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
  "message": "즐겨찾기 목록을 조회했습니다",
  "data": {
    "favoritePlaces": [
      {
        "id": "fp_abc123",
        "placeName": "명동",
        "address": "서울특별시 중구 명동2가",
        "nickname": "숙소",
        "latitude": 37.5636,
        "longitude": 126.9864,
        "createdAt": "2026-02-12T14:30:00Z"
      },
      {
        "id": "fp_def456",
        "placeName": "인천국제공항",
        "address": "인천광역시 중구 공항로",
        "nickname": "공항",
        "latitude": 37.4602,
        "longitude": 126.4407,
        "createdAt": "2026-02-10T09:15:00Z"
      }
    ],
    "total": 2
  }
}
```

---

## 4. 즐겨찾기 삭제

### 개요

**목적**: 즐겨찾기 장소를 삭제

**호출 주체**: 인증된 사용자

**성공 조건**: 유효한 인증 토큰, 본인의 즐겨찾기만 삭제 가능

---

### Request (요청)

**URL**: `/maps/favorites/{favoritePlaceId}`

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
  "message": "즐겨찾기가 삭제되었습니다",
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

**즐겨찾기 없음**:
```json
{
  "status": "NOT_FOUND",
  "message": "즐겨찾기를 찾을 수 없습니다",
  "data": null
}
```

**권한 없음**:
```json
{
  "status": "FORBIDDEN",
  "message": "본인의 즐겨찾기만 삭제할 수 있습니다",
  "data": null
}
```

---

## 5. 검색 기록 조회

### 개요

**목적**: 사용자의 최근 장소 검색 기록 조회 (최대 10개)

**호출 주체**: 인증된 사용자

**성공 조건**: 유효한 인증 토큰

---

### Request (요청)

**URL**: `/maps/search-history`

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
  "message": "검색 기록을 조회했습니다",
  "data": {
    "searchHistory": [
      {
        "id": "sh_abc123",
        "searchText": "명동",
        "createdAt": "2026-02-12T14:30:00Z"
      },
      {
        "id": "sh_def456",
        "searchText": "강남역",
        "createdAt": "2026-02-12T13:20:00Z"
      },
      {
        "id": "sh_ghi789",
        "searchText": "홍대입구",
        "createdAt": "2026-02-12T10:15:00Z"
      }
    ],
    "total": 3
  }
}
```

---

### 수도코드

```
Function 검색기록조회(userID):
    # 1. 최근 10개 검색 기록 조회
    SearchHistory = Find All SearchHistory
                    Where UserID = userID
                    Order By CreatedAt DESC
                    Limit 10

    # 2. 응답
    Return {
        status: "SUCCESS",
        message: "검색 기록을 조회했습니다",
        data: {
            searchHistory: SearchHistory,
            total: Count(SearchHistory)
        }
    }
```

**참고**: 검색 기록은 자동으로 저장되며, 10개를 초과하면 가장 오래된 것이 자동 삭제됩니다.

---

## 📝 주요 제약

### 서버 프록시 사용

**규칙**: 네이버 지도 API는 반드시 서버 프록시를 통해 호출합니다.

- 클라이언트는 직접 API 호출 불가 (API 키 노출 방지)
- 서버가 API 키 관리 및 요청 제한 처리

### 검색 기록 자동 관리

**규칙**: 검색 기록은 최근 10개까지만 보관합니다.

- 10개 초과 시 가장 오래된 것 자동 삭제
- 사용자는 수동 삭제 불가 (자동 관리)

### 즐겨찾기 최대 개수

**규칙**: 한 사용자는 최대 20개까지 즐겨찾기를 저장할 수 있습니다.

- 20개 초과 시 추가 불가
- 삭제 후 다시 추가 가능

### 사용자 탈퇴 시 처리

**규칙**: 사용자 탈퇴 시 검색 기록과 즐겨찾기는 완전히 삭제됩니다.

- SearchHistory: 완전 삭제
- FavoritePlace: 완전 삭제
- Route: 익명화되어 보관 (미션 기록용)

---

## 🗺️ 외부 지도 앱 연계

### 시나리오

1. 사용자가 경로 카드를 확인합니다.
2. "외부 지도에서 보기" 버튼을 누릅니다.
3. 시스템은 기기의 기본 지도 앱으로 경로를 전달합니다.
   - iOS: Apple Maps 또는 사용자 설정 앱
   - Android: Google Maps 또는 네이버 지도

**Deep Link 예시**:
```
nmap://route/public?slat=37.5665&slng=126.9780&sname=현재위치&dlat=37.5636&dlng=126.9864&dname=명동
```

---

**maps 도메인 API 완료** ✅
