import axios from 'axios';

/**
 * chap06 서버 전용 클라이언트. 서버 주소를 한 곳에만 적어 두기 위한 것이다.
 * 나중에 로그인 토큰을 붙인다면 인터셉터도 이 자리에 건다.
 */
const api = axios.create({ baseURL: 'http://localhost:8080' });

/**
 * 정상 응답 템플릿에서 result 만 꺼낸다.
 * 화면은 httpStatus 나 message 를 몰라도 되게 한다.
 */
export async function getResult(url, config) {
    const res = await api.get(url, config);
    return res.data.result;
}

export async function postResult(url, body) {
    const res = await api.post(url, body);
    return res.data.result;
}

export async function putResult(url, body) {
    const res = await api.put(url, body);
    return res.data.result;
}

export async function deleteResult(url) {
    const res = await api.delete(url);
    return res.data.result;
}

/**
 * 오류 응답 템플릿은 정상 응답과 모양이 다르다. result 가 없다.
 *   { code, description, detail }
 * 화면에 보여 줄 한 줄을 여기서 만들어 둔다.
 */
export function toMessage(err) {
    if (axios.isCancel(err)) return null;

    const data = err.response?.data;
    if (data?.description) return data.description;
    if (err.response) return `요청이 실패했습니다 (${err.response.status})`;
    return '서버에 연결하지 못했습니다. 8080 포트가 떠 있는지 확인해 주세요.';
}
