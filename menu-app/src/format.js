/**
 * 화면에 쓰는 표기 함수를 모아 둔다.
 *
 * 컴포넌트 파일(.jsx)에서 컴포넌트가 아닌 것을 같이 내보내면
 * Fast Refresh 가 동작하지 않는다. 그래서 이런 함수는 .js 로 뺀다.
 */

export const formatPrice = (won) => `${Number(won).toLocaleString('ko-KR')}원`;

export const formatCode = (code) => `No. ${String(code).padStart(3, '0')}`;
