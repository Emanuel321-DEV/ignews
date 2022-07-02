import { SigninButton } from "../SigninButton";
import style from "./styles.module.scss";
import { ActiveLink } from "../ActiveLink";

export function Header(){
    return (
        <header className={style.headerContainer}>
            <div className={style.headerContent}>
                <img src="/images/logo.svg" alt="ig-news"/>
                <nav>
                    <ActiveLink activeClassName={style.active} href="/"><a> Home </a></ActiveLink>
                    <ActiveLink activeClassName={style.active} href="/posts"><a> Posts </a></ActiveLink>
                </nav>


                <SigninButton/>
            
            </div>

        </header>

    )

}