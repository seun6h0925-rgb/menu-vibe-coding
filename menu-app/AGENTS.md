# 메뉴 관리 서비스 — 에이전트 지침

디자인 토큰으로 화면을 만들고, 데이터는 chap06 REST API 서버에서 가져온다.
API 명세는 `api-docs.json`에 정의되어 있다.

---

## 1. 화면 디자인 규칙 (1층 — 서버가 바뀌어도 동일)

### 1-1. 사용 라이브러리 및 프로젝트 생성
- 프로젝트는 `npm create vite@latest <이름> -- --template react --eslint`로 구성한다.  
  (※ `--eslint`를 빼면 다른 린터가 설치되므로 반드시 포함해야 함)
- 앱이 쓰는 라이브러리는 `react`, `react-dom`, `react-router`, `axios`만 사용한다.
- UI 라이브러리와 CSS 프레임워크는 도입하지 않으며, Vanilla CSS Module을 사용한다.
- TypeScript 문법을 사용하지 않는다 (JavaScript JSX 사용).

### 1-2. 폴더 구조
```
src/
    api/         서버 요청. 컴포넌트는 이 파일만 부른다
    components/  주소에 직접 대응하지 않는 화면 조각
    pages/       주소 하나에 대응하는 화면
```
- 주소(라우트)에 직접 대응하면 `pages/`, 아니면 `components/`에 둔다.

### 1-3. 상태 관리 기준
- 화면 하나에서만 쓰는 값은 `useState`에 둔다.
- 검색어(`q`), 최소 가격(`minPrice`), 카테고리(`category`), 페이지 번호(`page`)는 컴포넌트 `state`가 아니라 URL 쿼리스트링(`useSearchParams`)에 둔다.
- 서버에서 받아 온 목록은 해당 화면 컴포넌트가 갖는다.

### 1-4. 스타일 및 디자인 토큰 규칙
- 색은 반드시 `var(--토큰)`으로 작성하며, 하드코딩된 색상 값을 직접 쓰지 않는다.
- `font-size`를 직접 쓰지 않고 타입 스타일 유틸리티 클래스(`title1`, `label1`, `bold` 등)를 사용한다.
- 간격(margin, padding, gap)은 `--space-*` 스케일 안에서만 고른다.
- 토큰 목록은 `design/montage.tokens.json`을 참조한다.
- `src/tokens.css`는 `npm run tokens`가 만드는 생성물이며 직접 수정하지 않는다.

### 1-5. 확인 방법
- `npm run lint`와 `npm run build`를 실행하여 오류를 확인한다.
- 둘 다 통과해도 화면은 브라우저에서 직접 실행하여 확인한다.

---

## 2. REST API 통신 규칙 (2층 — 서버별 변경 사항)

### 2-1. 서버
- 주소는 `http://localhost:8080`이다. `baseURL`은 `src/api/client.js`의 axios 인스턴스 한 곳에만 적는다.
- 서버는 `http://localhost:5173`만 CORS로 허용한다. `5174`로 뜨면 요청이 막히므로 5173으로 다시 띄운다.

### 2-2. 데이터 요청
- 서버 요청은 `src/api/` 폴더의 `.js` 파일에만 둔다.
- 컴포넌트(`.jsx`)에서 `axios`나 `fetch`를 직접 부르지 않는다.
- 요청 주소는 `menuCode` · `categoryCode`로 조립한다. 서버가 링크를 주지 않는다.
- 페이지 번호(`page`)는 1부터 센다.

### 2-3. 응답 템플릿
> 정상 응답일 경우와 오류 응답일 경우의 템플릿 형태가 다름에 주의한다.

- **정상 응답 템플릿 (`ResponseMessage`)**:
  ```json
  { "httpStatus": 200, "message": "메뉴 목록 조회 성공", "result": { "menus": [] } }
  ```
- **오류 응답 템플릿 (`ErrorResponse`)**:
  ```json
  { "code": "ERROR_CODE_00001", "description": "메뉴 조회 실패", "detail": "..." }
  ```
- `result` 안을 `src/api/` 요청 모듈에서 꺼내 반환한다. 컴포넌트가 `ResponseMessage` 템플릿 전체 구조를 알지 않게 한다.
- 오류는 `code`와 `description`으로 판단한다. 오류 응답에는 `httpStatus`가 없다.
- 삭제 응답의 `httpStatus`는 204지만 실제 HTTP 상태 코드는 200이다.
- `orderableStatus`는 `'Y'` 또는 `'N'` 한 글자다.

### 2-4. API 명세에 없는 내용 (`api-docs.json` 보강 정보)
`result`는 `Map`이라 명세에 내부가 자동으로 드러나지 않는다. Key 이름은 각 API의 `description`과 아래 보강 지침을 따른다:
- **`CategoryDTO` 스키마가 명세에 없다.**
  * 필드는 `categoryCode`, `categoryName`, `refCategoryCode`, `refCategoryName` 이다.
  * 최상위 카테고리(식사·음료·디저트)는 `refCategoryCode`, `refCategoryName` 두 값이 `null`이다.
  * 메뉴는 하위 카테고리에 속한다.
- **`ErrorResponse` 스키마가 명세에 없다.**
  * 위의 오류 응답 템플릿 구조 (`code`, `description`, `detail`)를 따른다.
