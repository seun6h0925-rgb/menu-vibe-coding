import styles from './EmptyState.module.css';

export default function EmptyState({ tone = 'empty', title, description, action }) {
    return (
        <div className={`${styles.block} ${tone === 'error' ? styles.error : ''}`}>
            <p className={`${styles.title} headline1 bold`}>{title}</p>
            {description && <p className={`${styles.desc} body2`}>{description}</p>}
            {action}
        </div>
    );
}
