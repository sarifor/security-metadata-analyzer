# HOW-IT-WORKS.md <!-- omit in toc -->

## 목차 <!-- omit in toc -->
- [큰 그림: 우리가 만드는 것은?](#큰-그림-우리가-만드는-것은)
- [아키텍처: 3막 구조의 연극](#아키텍처-3막-구조의-연극)
- [코드베이스: 한 바퀴 둘러보기](#코드베이스-한-바퀴-둘러보기)
- [데이터 흐름: 클릭 한 번의 여정](#데이터-흐름-클릭-한-번의-여정)
  - [1단계: 메타데이터 불러오기](#1단계-메타데이터-불러오기)
  - [2단계: AI에게 분석 요청](#2단계-ai에게-분석-요청)
- [사용한 기술 (그리고 왜 선택했는지)](#사용한-기술-그리고-왜-선택했는지)
- [CORS 춤추기](#cors-춤추기)
- [교훈들 (삽질을 통해 배운 것)](#교훈들-삽질을-통해-배운-것)
  - [1. API 키는 비밀이다—비밀번호처럼 다뤄라](#1-api-키는-비밀이다비밀번호처럼-다뤄라)
  - [2. 프롬프트 엔지니어링이 절반이다](#2-프롬프트-엔지니어링이-절반이다)
  - [3. 가짜 데이터는 친구다](#3-가짜-데이터는-친구다)
  - [4. 바보같이 단순하게 유지하라](#4-바보같이-단순하게-유지하라)
- [잠재적 함정들 (그리고 피하는 방법)](#잠재적-함정들-그리고-피하는-방법)
  - [함정 1: "Module not found: apikey.js"](#함정-1-module-not-found-apikeyjs)
  - [함정 2: "CORS error: No 'Access-Control-Allow-Origin' header"](#함정-2-cors-error-no-access-control-allow-origin-header)
  - [함정 3: AI가 이상하거나 도움이 안 되는 응답을 줌](#함정-3-ai가-이상하거나-도움이-안-되는-응답을-줌)
  - [함정 4: "429 Too Many Requests"](#함정-4-429-too-many-requests)
- [좋은 엔지니어의 사고방식](#좋은-엔지니어의-사고방식)
  - [1. 아키텍처가 아니라 데모부터 시작하라](#1-아키텍처가-아니라-데모부터-시작하라)
  - [2. 일반적인 케이스를 빠르게 만들어라](#2-일반적인-케이스를-빠르게-만들어라)
  - [3. 관심사를 깔끔하게 분리하라](#3-관심사를-깔끔하게-분리하라)
  - [4. 큰 소리로 실패하라](#4-큰-소리로-실패하라)
- [다음은 뭘까?](#다음은-뭘까)
- [마지막 생각](#마지막-생각)

## 큰 그림: 우리가 만드는 것은?

당신이 보안 요원이라고 상상해보자. 50개의 모니터를 동시에 지켜보고 있다. 세 시간쯤 지나면 눈이 풀린다. 새벽 3시에 몰래 들어온 사람을 놓친다—하필 그 순간에 눈을 깜빡였기 때문에.

이제 다른 상황을 상상해보자. 영상을 직접 보는 대신, 간단한 메시지를 받는다: "어젯밤 지하 입구에서 이상한 일이 있었어요—보통 2-3명인데 자정부터 새벽 6시 사이에 27명이 나타났습니다. 영상을 확인해보시는 게 좋겠어요."

이 프로젝트가 정확히 그 일을 한다. 보안 카메라가 뱉어내는 지루한 숫자들(감지된 사람 수, 모션 이벤트 수)을 AI에게 먹여서, AI가 패턴을 *읽고* 뭐가 이상한지 알려준다.

---

## 아키텍처: 3막 구조의 연극

```
┌─────────────────────────────────┐
│         🖥️ 프론트엔드            │
│    (main.html + 바닐라 JS)       │
│    "사용자 인터페이스"             │
└───────────────┬─────────────────┘
                │
                │  HTTP 요청 (fetch API)
                ▼
┌─────────────────────────────────┐
│         🔧 백엔드               │
│    (Express.js on Node.js)      │
│    "중간 다리"                   │
└───────────────┬─────────────────┘
                │
                │  API 호출 (@google/genai SDK)
                ▼
┌─────────────────────────────────┐
│         🧠 Google Gemini AI    │
│    "두뇌"                       │
└─────────────────────────────────┘
```

식당에서 음식 주문하는 것과 비슷하다:
- **프론트엔드** = 손님인 당신. 메뉴를 보고 주문을 넣는다
- **백엔드** = 웨이터. 주문을 받아서 음식을 가져다준다
- **Gemini AI** = 셰프. 실제로 요리(분석)를 한다

---

## 코드베이스: 한 바퀴 둘러보기

```
security-metadata-analyzer/
├── server.js          ← 웨이터 (Express 서버)
├── main.html          ← 메뉴판과 테이블 (UI)
├── apikey.js          ← 셰프의 비밀 레시피 (API 키, git에서 제외!)
├── package.json       ← 식당의 사업자등록증
├── README.md          ← 환영 간판 (일본어)
└── CLAUDE.md          ← AI 어시스턴트용 메타 지침
```

이게 전부다. 두 개의 메인 파일이 모든 일을 한다. 프레임워크 과잉 없음. 47개의 설정 파일 없음. 그냥 순수하고 읽기 쉬운 코드.

---

## 데이터 흐름: 클릭 한 번의 여정

### 1단계: 메타데이터 불러오기

브라우저에서 "Load Metadata"를 클릭하면:

```javascript
// main.html
async function loadMetadata() {
    const res = await fetch("http://localhost:3000/metadata");
    const data = await res.json();
    metadataFromSdk = data;
    document.getElementById("metadata").textContent = JSON.stringify(data, null, 2);
}
```

프론트엔드가 백엔드에게 묻는다: "야, 카메라 데이터 좀 줘."

백엔드가 실제 보안 카메라 SDK가 반환하는 것과 *똑같이 생긴* 가짜 메타데이터로 응답한다:

```javascript
// server.js
const fakeMetadataFromSdk = {
    cameraId: "B1-ENT-03",
    location: "Basement Entrance",
    period: "2026-01-01 ~ 2026-01-04",
    hourlySummary: [
        {
            date: "2026-01-01",
            hours: [
                { hour: "00-06", objectCount: 2, motionEvents: 1 },
                { hour: "06-12", objectCount: 15, motionEvents: 8 },
                // ... 더 많은 시간대
            ]
        },
        // ... 더 많은 날짜
    ]
}
```

왜 가짜 데이터를 쓸까? 목표가 *통합 패턴*을 시연하는 것이지, 실제 카메라에 연결하는 게 아니기 때문이다. 이게 어떻게 작동하는지 이해하면, 실제 SDK 호출로 바꾸는 건 일도 아니다.

### 2단계: AI에게 분석 요청

"Analyze"를 클릭하면:

```javascript
// main.html
async function analyze() {
    const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadataFromSdk)
    });
    const data = await res.json();
    document.getElementById("result").textContent = data.result;
}
```

백엔드가 이걸 받아서 Gemini를 위한 아주 구체적인 프롬프트를 만든다:

```javascript
// server.js
const prompt = `You are a surveillance data analyst.
Below is metadata from a security camera SDK.
Compare all 4 days and identify the most unusual activity pattern.

Output rules:
- Maximum 3 lines
- Plain text (no bullets or special formatting)
- Include reasoning

Warning: Avoid definitive conclusions. Use words like "may indicate" or "could suggest".

Metadata:
${JSON.stringify(metadata, null, 2)}`;
```

이게 바로 **프롬프트 엔지니어링**의 실전이다. 우리가 뭘 하는지 보자:
1. AI에게 역할을 부여한다 ("surveillance data analyst")
2. 뭘 해야 하는지 설명한다 ("compare all 4 days")
3. 출력 형식을 제한한다 ("maximum 3 lines, plain text")
4. 안전장치를 건다 ("avoid definitive conclusions")

결과는? Gemini가 1월 2일에 수상한 활동이 있었다는 걸 잡아낸다: 자정부터 새벽 6시 사이에 27개의 객체가 감지됐는데, 다른 날은 2-5개밖에 없었다. 침입 시도일 수도 있고, 심야 파티일 수도 있다. 어느 쪽이든 확인해볼 가치가 있다.

---

## 사용한 기술 (그리고 왜 선택했는지)

| 기술 | 선택 이유 |
|------|----------|
| **Node.js + Express** | HTTP 서버를 띄우는 가장 빠른 방법. 보일러플레이트 없음. `npm init`, `npm install express`, 끝. |
| **바닐라 JavaScript** | React 없음, Vue 없음, 빌드 단계 없음. HTML 파일 열면 바로 작동. 데모에 완벽. |
| **Google Gemini 2.5 Flash** | 빠르고, 저렴하고, 패턴 인식에 충분히 똑똑함. "Flash" 버전은 깊이보다 속도에 최적화됨—실시간 분석에 이상적. |
| **ES6 Modules** | `require()` 대신 `import/export` 사용. 2026년인데 모던 자바스크립트 쓰자. |
| **VS Code Live Server** | 원클릭 로컬 개발 서버, 핫 리로드 지원. 프론트엔드는 5500 포트, 백엔드는 3000 포트에서 돌아감. |

---

## CORS 춤추기

모든 초보자를 넘어뜨리는 것: **CORS** (Cross-Origin Resource Sharing, 교차 출처 리소스 공유).

프론트엔드는 `localhost:5500`에서 돌아간다 (Live Server). 백엔드는 `localhost:3000`에서 돌아간다 (Express). 둘 다 "localhost"인데, 브라우저는 포트가 다르기 때문에 *다른 출처*로 간주한다.

기본적으로 브라우저는 다른 출처 간의 요청을 차단한다. 보안 기능이다. 이게 없으면 아무 웹사이트나 로그인된 상태에서 당신의 은행 API에 요청을 날릴 수 있다.

해결책? 백엔드에게 다른 출처의 요청을 명시적으로 허용하라고 알려주면 된다:

```javascript
// server.js
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
```

`*`는 "모두 허용"을 의미한다. 프로덕션에서는 실제 도메인으로 바꿔야 한다. 하지만 로컬 개발에서는 `*`로 충분하다.

---

## 교훈들 (삽질을 통해 배운 것)

### 1. API 키는 비밀이다—비밀번호처럼 다뤄라

`apikey.js`가 `.gitignore`에 있는 거 봤지? 의도적이다. API 키를 GitHub에 커밋하면, 봇들이 몇 분 안에 찾아내서 당신 계정에 수천 달러의 비용을 청구한다.

```javascript
// apikey.js (절대 커밋하지 마!)
export const GEMINI_API_KEY = "your-secret-key-here";
```

패턴: 비밀은 별도 파일에 보관하고, 필요한 곳에서 import하고, 그 파일은 *절대* 커밋하지 않는다.

### 2. 프롬프트 엔지니어링이 절반이다

프롬프트의 첫 번째 버전은 이랬다:

```
Analyze this data and find anomalies.
```

결과? Gemini가 이상 탐지를 위한 통계 방법론에 대해 500단어짜리 에세이를 썼다. 도움이 안 됐다.

최종 버전에는 다음이 포함된다:
- 구체적인 역할
- 명확한 지시
- 출력 형식 제약
- 안전 문구

교훈: **원하는 것에 대해 구체적으로 말하고, 원하지 않는 것에 대해서는 더 구체적으로 말하라.**

### 3. 가짜 데이터는 친구다

실제 카메라 SDK를 연동하는 데 며칠을 쓰는 대신, 진짜처럼 *보이는* 하드코딩된 데이터를 사용했다. 덕분에:
- 전체 흐름을 즉시 테스트할 수 있었다
- 재미있는 부분(AI 분석)에 집중할 수 있었다
- 하드웨어 없이 데모를 공유할 수 있었다

패턴이 작동하면, 실제 데이터로 바꾸는 건 10분이면 된다.

### 4. 바보같이 단순하게 유지하라

이 프로젝트의 npm 의존성은 정확히 두 개다: `express`와 `@google/genai`. 끝.

TypeScript 없음 (데모에는 JavaScript면 충분). React 없음 (바닐라 JS가 작동함). 데이터베이스 없음 (인메모리 데이터가 완벽함). Docker 없음 (그냥 `node server.js` 실행하면 됨).

추가되는 모든 도구는 잠재적인 장애 지점이다. 해결해야 할 구체적인 문제가 있을 때만 복잡성을 추가하라.

---

## 잠재적 함정들 (그리고 피하는 방법)

### 함정 1: "Module not found: apikey.js"

**문제:** 저장소를 클론하고 `node server.js`를 실행했는데 즉시 크래시됨.

**해결:** `apikey.js` 파일을 수동으로 생성하라:
```javascript
export const GEMINI_API_KEY = "your-actual-api-key";
```

API 키는 [Google AI Studio](https://aistudio.google.com/)에서 받을 수 있다.

### 함정 2: "CORS error: No 'Access-Control-Allow-Origin' header"

**문제:** 프론트엔드가 백엔드에 접근하지 못함.

**해결:** 백엔드가 실행 중인지 (`node server.js`) 그리고 CORS 미들웨어가 제대로 설정됐는지 확인하라.

### 함정 3: AI가 이상하거나 도움이 안 되는 응답을 줌

**문제:** Gemini가 가끔 형식 지시를 무시함.

**해결:** 더 명시적으로 하라. 예시를 추가하라. "You MUST"나 "NEVER do X" 같은 문구를 사용하라. AI 모델은 강한 제약에 잘 반응한다.

### 함정 4: "429 Too Many Requests"

**문제:** Gemini의 속도 제한에 걸림.

**해결:** 무료 티어에는 제한이 있다. 1분 기다리거나, 플랜을 업그레이드하거나, 요청 스로틀링을 구현하라.

---

## 좋은 엔지니어의 사고방식

이 프로젝트는 괜찮은 엔지니어와 훌륭한 엔지니어를 구분하는 몇 가지 원칙을 보여준다:

### 1. 아키텍처가 아니라 데모부터 시작하라

종이 위에서 완벽한 시스템을 설계하는 대신, 몇 시간 만에 작동하는 프로토타입을 만들었다. 이제 패턴이 작동한다는 걸 *안다*. 스케일링은 별개의 문제다.

### 2. 일반적인 케이스를 빠르게 만들어라

90%의 시간은 AI 분석을 테스트하는 데 쓴다. 그래서 그 경로를 최대한 짧게 만들었다: Load 클릭, Analyze 클릭, 결과 확인. 로그인 없음, 설정 없음, 설치 마법사 없음.

### 3. 관심사를 깔끔하게 분리하라

- 프론트엔드는 UI를 담당
- 백엔드는 비즈니스 로직과 외부 API를 담당
- 각각 독립적으로 수정 가능

### 4. 큰 소리로 실패하라

뭔가 잘못되면, 코드가 조용히 쓰레기를 반환하는 대신 명확한 에러를 던진다. 이게 디버깅을 10배 쉽게 만든다.

---

## 다음은 뭘까?

이걸 실제 제품으로 만들고 싶다면, 로드맵은 이렇다:

1. **가짜 데이터를 실제 SDK로 교체** - 실제 카메라 API에 연결
2. **인증 추가** - 모든 사람이 보안 데이터를 봐선 안 됨
3. **히스토리 저장** - 시간에 따른 이상 징후를 추적하는 데이터베이스 사용
4. **실시간 알림** - 이상한 일이 생기면 푸시 알림
5. **멀티 카메라 지원** - 모든 카메라를 한 번에 보여주는 대시보드

하지만 기억하라: 데모의 목적은 개념을 증명하는 것이지, 프로덕션에 배포할 준비를 하는 게 아니다. 이 데모는 그 역할을 훌륭하게 해냈다.

---

## 마지막 생각

이 프로젝트는 **최소 실행 가능 아키텍처**의 마스터클래스다. 진짜 유용한 것—AI 기반 보안 분석—을 다음만으로 만들 수 있음을 증명한다:

- 소스 파일 2개
- npm 패키지 2개
- 코드 약 150줄
- 설정 지옥 제로

최고의 코드는 작성하지 않은 코드다. 두 번째로 좋은 코드는 누구나 5분 안에 이해할 수 있을 만큼 단순한 코드다.

이제 가서 멋진 걸 만들어라.
