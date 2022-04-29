import { AppProps } from 'next/app'; 
import {Header} from "../components/Header/index";
import {SessionProvider as NextAuthProvider} from "next-auth/react"

import '../styles/global.scss'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Quando o usuario da um f5 na pagina as informações da sessão ativa do usuario, se está logado ou nao vão chegar pra mim atraves de pageprops, e estamos repassando isso para dentro do NextAuthProvider
    <NextAuthProvider session={pageProps.session}>
      <Header/>
      <Component {...pageProps} />
    </NextAuthProvider>
  )
}

export default MyApp
