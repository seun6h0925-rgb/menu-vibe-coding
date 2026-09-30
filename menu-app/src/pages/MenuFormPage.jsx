import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createMenu, fetchMenu, updateMenu } from '../api/menu.js';
import { fetchCategories, onlyChildren } from '../api/category.js';
import { toMessage } from '../api/client.js';
import Button from '../components/Button.jsx';
import styles from './MenuFormPage.module.css';

const EMPTY = { menuName: '', menuPrice: '', categoryCode: '', orderableStatus: 'Y' };

function validate(form) {
    const errors = {};
    if (!form.menuName.trim()) errors.menuName = '메뉴 이름을 입력해 주세요.';
    if (form.menuPrice === '' || Number(form.menuPrice) < 0) {
        errors.menuPrice = '0원 이상의 가격을 입력해 주세요.';
    }
    if (!form.categoryCode) errors.categoryCode = '카테고리를 골라 주세요.';
    return errors;
}

export default function MenuFormPage() {
    const { menuCode } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(menuCode);

    const [form, setForm] = useState(EMPTY);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [banner, setBanner] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        fetchCategories(controller.signal)
            .then((list) => setCategories(onlyChildren(list)))
            .catch((err) => {
                const message = toMessage(err);
                if (message) setBanner(message);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!editing) return;

        const controller = new AbortController();
        fetchMenu(menuCode, controller.signal)
            .then((menu) =>
                setForm({
                    menuName: menu.menuName,
                    menuPrice: String(menu.menuPrice),
                    categoryCode: String(menu.categoryCode),
                    orderableStatus: menu.orderableStatus,
                }),
            )
            .catch((err) => {
                const message = toMessage(err);
                if (message) setBanner(message);
            });
        return () => controller.abort();
    }, [menuCode, editing]);

    const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();

        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        const payload = {
            menuName: form.menuName.trim(),
            menuPrice: Number(form.menuPrice),
            categoryCode: Number(form.categoryCode),
            orderableStatus: form.orderableStatus,
        };

        setSaving(true);
        setBanner(null);
        try {
            const saved = editing
                ? await updateMenu(menuCode, payload)
                : await createMenu(payload);
            navigate(`/menus/${saved.menuCode}`, { replace: true });
        } catch (err) {
            setBanner(toMessage(err));
            setSaving(false);
        }
    }

    return (
        <div className={styles.page}>
            <Link to={editing ? `/menus/${menuCode}` : '/'} className={`${styles.back} label1`}>
                돌아가기
            </Link>

            <h1 className={`${styles.title} title1 bold`}>{editing ? '메뉴 수정' : '메뉴 등록'}</h1>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {banner && <p className={`${styles.banner} body2`}>{banner}</p>}

                <div className={styles.field}>
                    <label htmlFor="menuName" className={`${styles.label} label1`}>
                        메뉴 이름
                    </label>
                    <input
                        id="menuName"
                        className={`${styles.control} body1 ${errors.menuName ? styles.invalid : ''}`}
                        value={form.menuName}
                        onChange={set('menuName')}
                        placeholder="예: 바질 토마토 파스타"
                    />
                    {errors.menuName && (
                        <span className={`${styles.errorText} caption1`}>{errors.menuName}</span>
                    )}
                </div>

                <div className={styles.field}>
                    <label htmlFor="menuPrice" className={`${styles.label} label1`}>
                        가격
                    </label>
                    <input
                        id="menuPrice"
                        type="number"
                        min="0"
                        step="100"
                        className={`${styles.control} body1 ${errors.menuPrice ? styles.invalid : ''}`}
                        value={form.menuPrice}
                        onChange={set('menuPrice')}
                        placeholder="예: 4500"
                    />
                    {errors.menuPrice && (
                        <span className={`${styles.errorText} caption1`}>{errors.menuPrice}</span>
                    )}
                </div>

                <div className={styles.field}>
                    <label htmlFor="categoryCode" className={`${styles.label} label1`}>
                        카테고리
                    </label>
                    <select
                        id="categoryCode"
                        className={`${styles.control} body1 ${errors.categoryCode ? styles.invalid : ''}`}
                        value={form.categoryCode}
                        onChange={set('categoryCode')}
                    >
                        <option value="">선택 안 함</option>
                        {categories.map((c) => (
                            <option key={c.categoryCode} value={c.categoryCode}>
                                {c.refCategoryName} / {c.categoryName}
                            </option>
                        ))}
                    </select>
                    {errors.categoryCode && (
                        <span className={`${styles.errorText} caption1`}>{errors.categoryCode}</span>
                    )}
                </div>

                <div className={styles.field}>
                    <span className={`${styles.label} label1`}>주문 가능 여부</span>
                    <div className={styles.radios}>
                        {[
                            { value: 'Y', text: '주문 가능' },
                            { value: 'N', text: '주문 불가' },
                        ].map((option) => (
                            <label
                                key={option.value}
                                className={`${styles.radio} label1 ${
                                    form.orderableStatus === option.value ? styles.radioOn : ''
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="orderableStatus"
                                    value={option.value}
                                    checked={form.orderableStatus === option.value}
                                    onChange={set('orderableStatus')}
                                />
                                {option.text}
                            </label>
                        ))}
                    </div>
                    <span className={`${styles.hint} caption1`}>
                        서버에는 Y 또는 N 값으로 저장됩니다.
                    </span>
                </div>

                <div className={styles.actions}>
                    <Link to={editing ? `/menus/${menuCode}` : '/'}>
                        <Button variant="secondary" disabled={saving}>
                            취소
                        </Button>
                    </Link>
                    <Button type="submit" onClick={handleSubmit} disabled={saving}>
                        {saving ? '저장 중...' : editing ? '수정 저장' : '등록'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
