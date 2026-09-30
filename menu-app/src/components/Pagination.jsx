import styles from './Pagination.module.css';

/** 1부터 세는 페이지 번호로 [1 … 4 5 6 … 14] 모양을 만든다. */
function buildPages(page, lastPage) {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, i) => ({ page: i + 1, key: i + 1 }));
    }

    const near = [page - 1, page, page + 1].filter((n) => n > 1 && n < lastPage);
    const shown = [...new Set([1, ...near, lastPage])].sort((a, b) => a - b);

    const items = [];
    let prev = 0;
    for (const n of shown) {
        if (n - prev > 1) items.push({ gap: true, key: `gap-${n}` });
        items.push({ page: n, key: n });
        prev = n;
    }
    return items;
}

export default function Pagination({ page, lastPage, onChange }) {
    if (lastPage <= 1) return null;

    const items = buildPages(page, lastPage);

    return (
        <nav className={styles.nav} aria-label="페이지">
            <button
                type="button"
                className={`${styles.arrow} label1`}
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
                aria-label="이전 페이지"
            >
                ‹
            </button>

            {items.map((item) =>
                item.gap ? (
                    <span key={item.key} className={`${styles.gap} body2`} aria-hidden="true">
                        …
                    </span>
                ) : (
                    <button
                        key={item.key}
                        type="button"
                        className={`${styles.page} label1 ${item.page === page ? styles.current : ''}`}
                        onClick={() => onChange(item.page)}
                        aria-current={item.page === page ? 'page' : undefined}
                    >
                        {item.page}
                    </button>
                ),
            )}

            <button
                type="button"
                className={`${styles.arrow} label1`}
                onClick={() => onChange(page + 1)}
                disabled={page >= lastPage}
                aria-label="다음 페이지"
            >
                ›
            </button>
        </nav>
    );
}
