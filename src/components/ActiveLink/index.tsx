import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement, cloneElement } from 'react';


interface ActiveLinkProps extends LinkProps { // Propriedades ActiveLinkProps somada com as do LinkProps
    children: ReactElement; // Irá receber uma ancora, por isso do react element
    activeClassName: string; // 
}


export function ActiveLink({children, activeClassName, ...rest}: ActiveLinkProps){
    const { asPath } = useRouter(); // Verifica qual é o path que estamos: /Post ou /
    
    const className = asPath === rest.href // Retorna true se o path atual for igual ao path passado em href
    ? activeClassName 
    : '';

    return (
        <Link {...rest} >
            {cloneElement(children, { 
                className,
            } )} 
        </Link>
    )
}