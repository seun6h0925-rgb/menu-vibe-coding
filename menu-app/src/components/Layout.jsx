import { Link, NavLink, Outlet } from 'react-router';
import dolhareubangLogo from '../assets/dolhareubang.png';
import styles from './Layout.module.css';

export default function Layout() {
    return (
        <div className={styles.shell}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <Link to="/" className={styles.brand}>
                        <img src={dolhareubangLogo} alt="" className={styles.mark} aria-hidden="true" />
                        <span className={`${styles.brandText} headline1 bold`}>혼저 옵서예</span>
                    </Link>

                    <nav className={styles.nav}>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `${styles.navLink} label1 ${isActive ? styles.current : ''}`
                            }
                        >
                            메뉴 목록
                        </NavLink>
                        <NavLink
                            to="/menus/new"
                            className={({ isActive }) =>
                                `${styles.navLink} label1 ${isActive ? styles.current : ''}`
                            }
                        >
                            메뉴 등록
                        </NavLink>
                    </nav>
                </div>
            </header>

            <main className={styles.main}>
                <Outlet />
            </main>

            <footer className={styles.footer}>
                <div className={`${styles.footerInner} caption1`}>
                    <span>Spring Data JPA chap06 · React 19 + Vite</span>
                    <span>디자인 토큰 : Montage (Wanted)</span>
                </div>
            </footer>
        </div>
    );
}
