import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { fetchAllMenus, fetchMenuPage, searchMenusOverPrice } from '../api/menu.js';
import { fetchCategories, onlyChildren } from '../api/category.js';
import { toMessage } from '../api/client.js';
import MenuCard, { MenuCardSkeleton } from '../components/MenuCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Filters from '../components/Filters.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import styles from './MenuListPage.module.css';

const PAGE_SIZE = 12;

export default function MenuListPage() {
    const [params, setParams] = useSearchParams();

    const page = Math.max(1, Number(params.get('page')) || 1);
    const keyword = params.get('q') ?? '';
    const minPrice = params.get('minPrice') ?? '';
    const categoryCode = params.get('category') ?? '';

    const filtering = keyword !== '' || minPrice !== '' || categoryCode !== '';

    const [categories, setCategories] = useState([]);
    const [menus, setMenus] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchCategories(controller.signal)
            .then((list) => setCategories(onlyChildren(list)))
            .catch((err) => {
                const message = toMessage(err);
                if (message) setError(message);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setError(null);
            try {
                if (!filtering) {
                    const result = await fetchMenuPage(
                        { page, size: PAGE_SIZE },
                        controller.signal,
                    );
                    setMenus(result.menus);
                    setPageInfo(result);
                } else {
                    const base =
                        minPrice !== ''
                            ? await searchMenusOverPrice(Number(minPrice), controller.signal)
                            : await fetchAllMenus(controller.signal);
                    setMenus(base);
                    setPageInfo(null);
                }
            } catch (err) {
                const message = toMessage(err);
                if (message) setError(message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, [page, keyword, minPrice, categoryCode, filtering]);

    const filtered = useMemo(() => {
        if (!filtering) return menus;
        const needle = keyword.trim().toLowerCase();
        return menus.filter((m) => {
            if (needle && !m.menuName.toLowerCase().includes(needle)) return false;
            if (categoryCode && String(m.categoryCode) !== categoryCode) return false;
            return true;
        });
    }, [menus, keyword, categoryCode, filtering]);

    const lastPage = filtering
        ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
        : (pageInfo?.totalPages ?? 1);

    const current = Math.min(page, lastPage);

    const shown = filtering
        ? filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
        : filtered;

    const total = filtering ? filtered.length : (pageInfo?.totalElements ?? 0);

    const change = useCallback(
        (patch) => {
            const next = { q: keyword, minPrice, category: categoryCode, page: 1, ...patch };
            const query = {};
            if (next.q) query.q = next.q;
            if (next.minPrice) query.minPrice = next.minPrice;
            if (next.category) query.category = next.category;
            if (next.page > 1) query.page = String(next.page);
            setParams(query);
        },
        [keyword, minPrice, categoryCode, setParams],
    );

    const goPage = useCallback(
        (next) => {
            change({ page: next });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [change],
    );

    return (
        <div className={styles.page}>
            <div className={styles.head}>
                <div>
                    <h1 className={`${styles.title} title1 bold`}>메뉴 목록</h1>
                    <p className={`${styles.summary} label1-reading`}>
                        {loading
                            ? '불러오는 중...'
                            : `전체 ${total.toLocaleString('ko-KR')}개 중 ${shown.length}개 표시`}
                    </p>
                </div>
            </div>

            <Filters
                keyword={keyword}
                minPrice={minPrice}
                categoryCode={categoryCode}
                categories={categories}
                onChange={change}
            />

            {error ? (
                <EmptyState
                    tone="error"
                    title="목록을 불러오지 못했습니다."
                    description={error}
                    action={
                        <Button variant="secondary" onClick={() => window.location.reload()}>
                            다시 시도
                        </Button>
                    }
                />
            ) : loading ? (
                <ul className={styles.grid}>
                    {Array.from({ length: PAGE_SIZE }, (_, i) => (
                        <li key={i}>
                            <MenuCardSkeleton />
                        </li>
                    ))}
                </ul>
            ) : shown.length === 0 ? (
                <EmptyState
                    title="조건에 맞는 메뉴가 없습니다."
                    description="이름을 줄이거나 가격·카테고리 조건을 다시 보세요."
                    action={
                        filtering && (
                            <Button variant="secondary" onClick={() => setParams({})}>
                                조건 초기화
                            </Button>
                        )
                    }
                />
            ) : (
                <>
                    <ul className={styles.grid}>
                        {shown.map((menu) => (
                            <li key={menu.menuCode}>
                                <MenuCard menu={menu} />
                            </li>
                        ))}
                    </ul>
                    <Pagination page={current} lastPage={lastPage} onChange={goPage} />
                </>
            )}
        </div>
    );
}
