import { useEffect, useId, useState } from 'react';
import styles from './Filters.module.css';

function useDebounced(value, onSettled, delay = 300) {
    const [draft, setDraft] = useState(value);
    const [seen, setSeen] = useState(value);

    if (value !== seen) {
        setSeen(value);
        setDraft(value);
    }

    useEffect(() => {
        if (draft === value) return;
        const timer = setTimeout(() => onSettled(draft), delay);
        return () => clearTimeout(timer);
    }, [draft, value, delay, onSettled]);

    return [draft, setDraft];
}

export default function Filters({ keyword, minPrice, categoryCode, categories, onChange }) {
    const keywordId = useId();
    const priceId = useId();

    const [keywordDraft, setKeywordDraft] = useDebounced(keyword, (v) => onChange({ q: v }));
    const [priceDraft, setPriceDraft] = useDebounced(minPrice, (v) => onChange({ minPrice: v }));

    return (
        <div className={styles.wrap}>
            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor={keywordId} className={`${styles.legend} label2`}>
                        이름
                    </label>
                    <input
                        id={keywordId}
                        type="search"
                        className={`${styles.input} body1`}
                        placeholder="메뉴 이름으로 찾기"
                        value={keywordDraft}
                        onChange={(e) => setKeywordDraft(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor={priceId} className={`${styles.legend} label2`}>
                        가격
                    </label>
                    <input
                        id={priceId}
                        type="number"
                        min="0"
                        step="1000"
                        className={`${styles.input} body1`}
                        placeholder="최소 금액 초과"
                        value={priceDraft}
                        onChange={(e) => setPriceDraft(e.target.value)}
                    />
                    <span className={`${styles.unit} label2`}>원 초과</span>
                </div>
            </div>

            <div className={styles.chips}>
                <button
                    type="button"
                    className={`${styles.chip} label1 ${categoryCode === '' ? styles.on : ''}`}
                    onClick={() => onChange({ category: '' })}
                >
                    전체
                </button>
                {categories.map((c) => (
                    <button
                        key={c.categoryCode}
                        type="button"
                        className={`${styles.chip} label1 ${
                            categoryCode === String(c.categoryCode) ? styles.on : ''
                        }`}
                        onClick={() => onChange({ category: String(c.categoryCode) })}
                    >
                        {c.categoryName}
                    </button>
                ))}
            </div>
        </div>
    );
}
