import { Link } from 'react-router';
import styles from './MenuCard.module.css';
import { formatPrice, formatCode } from '../format.js';

export default function MenuCard({ menu }) {
    const orderable = menu.orderableStatus === 'Y';

    return (
        <Link
            to={`/menus/${menu.menuCode}`}
            className={styles.card}
            aria-label={`${menu.menuName} 상세 보기`}
        >
            <div className={styles.top}>
                <span className={`${styles.name} headline2 bold`}>{menu.menuName}</span>
                <span className={`${styles.code} caption1`}>{formatCode(menu.menuCode)}</span>
            </div>

            <p className={`${styles.price} title3 bold`}>{formatPrice(menu.menuPrice)}</p>

            <div className={styles.meta}>
                <span className={`${styles.chip} label2`}>{menu.categoryName}</span>
                <span className={`${styles.status} ${orderable ? styles.on : styles.off} label2`}>
                    <span className={styles.dot} aria-hidden="true" />
                    {orderable ? '주문 가능' : '주문 불가'}
                </span>
            </div>
        </Link>
    );
}

export function MenuCardSkeleton() {
    return <div className={styles.skeleton} aria-hidden="true" />;
}
