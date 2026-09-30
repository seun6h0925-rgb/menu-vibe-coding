import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { fetchMenu, removeMenu } from '../api/menu.js';
import { toMessage } from '../api/client.js';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatCode, formatPrice } from '../format.js';
import styles from './MenuDetailPage.module.css';

export default function MenuDetailPage() {
    const { menuCode } = useParams();
    const navigate = useNavigate();

    const [loaded, setLoaded] = useState({ code: null, menu: null, error: null });
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        fetchMenu(menuCode, controller.signal)
            .then((menu) => setLoaded({ code: menuCode, menu, error: null }))
            .catch((err) => {
                const message = toMessage(err);
                if (message) setLoaded({ code: menuCode, menu: null, error: message });
            });

        return () => controller.abort();
    }, [menuCode]);

    const ready = loaded.code === menuCode;
    const menu = ready ? loaded.menu : null;
    const error = ready ? loaded.error : null;

    async function handleRemove() {
        if (!window.confirm(`${menu.menuName} 메뉴를 삭제하시겠습니까?`)) {
            return;
        }

        setRemoving(true);
        try {
            const deletedMenuCode = await removeMenu(menuCode);
            if (String(deletedMenuCode) === String(menuCode)) {
                navigate('/', { replace: true });
                return;
            }

            setLoaded({
                code: menuCode,
                menu,
                error: '삭제 응답의 메뉴 코드가 요청한 메뉴 코드와 다릅니다.',
            });
            setRemoving(false);
        } catch (err) {
            setLoaded({ code: menuCode, menu, error: toMessage(err) });
            setRemoving(false);
        }
    }

    if (error) {
        return (
            <EmptyState
                tone="error"
                title="메뉴 처리에 실패했습니다."
                description={error}
                action={
                    <Link to="/">
                        <Button variant="secondary">목록으로 돌아가기</Button>
                    </Link>
                }
            />
        );
    }

    if (!menu) {
        return <p className="body1">불러오는 중...</p>;
    }

    const orderable = menu.orderableStatus === 'Y';

    return (
        <article className={styles.page}>
            <Link to="/" className={`${styles.back} label1`}>
                목록으로 돌아가기
            </Link>

            <div className={styles.hero}>
                <span className={`${styles.code} label1`}>{formatCode(menu.menuCode)}</span>
                <h1 className={`${styles.name} display3 bold`}>{menu.menuName}</h1>
                <p className={`${styles.price} title1 bold`}>{formatPrice(menu.menuPrice)}</p>

                <dl className={styles.facts}>
                    <div className={styles.fact}>
                        <dt className={`${styles.factLabel} caption1`}>카테고리</dt>
                        <dd className={`${styles.factValue} headline2 bold`}>{menu.categoryName}</dd>
                    </div>
                    <div className={styles.fact}>
                        <dt className={`${styles.factLabel} caption1`}>메뉴 코드</dt>
                        <dd className={`${styles.factValue} headline2 bold`}>{menu.menuCode}</dd>
                    </div>
                    <div className={styles.fact}>
                        <dt className={`${styles.factLabel} caption1`}>주문 가능 여부</dt>
                        <dd className={`${styles.factValue} headline2 bold`}>
                            {orderable ? '주문 가능 (Y)' : '주문 불가 (N)'}
                        </dd>
                    </div>
                </dl>
            </div>

            <div className={styles.actions}>
                <Link to={`/menus/${menu.menuCode}/edit`}>
                    <Button>수정</Button>
                </Link>
                <Button variant="danger" onClick={handleRemove} disabled={removing}>
                    {removing ? '삭제 중...' : '삭제'}
                </Button>
            </div>
        </article>
    );
}
