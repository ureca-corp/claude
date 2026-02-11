# users 도메인

> 소셜 로그인 기반 회원 관리 및 프로필 관리

## 📖 목차

1. [기능 정의](./features.md)
2. [도메인 모델](./domain-model.md)
3. [API 명세](./api-spec.md)
4. [비즈니스 규칙](./business-rules.md)

## 📝 개요

users 도메인은 여행자가 앱을 사용하기 위한 회원 관리를 담당합니다. Google과 Apple 소셜 로그인을 통해 간편하게 가입하고, 프로필과 선호 언어를 관리할 수 있습니다. 탈퇴 시 개인정보는 익명화되지만 활동 기록은 보관됩니다.

## 🎯 핵심 기능

- 소셜 로그인 (Google/Apple)
- 프로필 조회 및 수정
- 선호 언어 설정
- 회원 탈퇴 (Soft Delete)

## 📊 주요 엔티티

- **User**: 앱 사용자 정보 (이메일, 표시 이름, 프로필 사진, 선호 언어)
- **SocialProvider**: 소셜 로그인 제공자 (Google, Apple)
- **UserStatus**: 계정 상태 (활성, 탈퇴)

## 🔗 도메인 의존성

- **의존하는 도메인**: 없음 (독립 도메인)
- **이 도메인에 의존하는 도메인**: translations, missions, maps (모든 도메인이 User를 참조함)
