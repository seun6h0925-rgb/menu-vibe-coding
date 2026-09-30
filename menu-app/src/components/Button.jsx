import styles from './Button.module.css';

export default function Button({ variant = 'primary', size = 'medium', className = '', ...rest }) {
    const type = size === 'small' ? 'label2' : 'label1';
    return (
        <button
            type="button"
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${type} medium ${className}`}
            {...rest}
        />
    );
}
