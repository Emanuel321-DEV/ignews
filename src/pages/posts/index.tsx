import { GetStaticProps } from 'next';
import Head from 'next/head';
import styles from './style.module.scss'
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom' // Essa biblioteca converte o conteudo do prismic pra texto ou html

import Link from 'next/link';

type Post = {
    slug: string;
    title: string;
    excertp: string;
    updatedAt: string
}

interface PostsProps { 
    posts: Post[];
}

export default function Posts({posts }: PostsProps){ // posts: retornado da funcao getSaticProps
    return( 
        <>
            <Head>
                <title>POSTS | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        <Link key={post.slug} href={`/posts/${post.slug}`}>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excertp}</p>
                            </a>
                        </Link> 

                                
                    ))}
                </div>
            </main>
        
        </>
    )
}


export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient();

    // Faz uma buscar no prismic, em que o tipo do documento é publication. predicates é como se fosse um where do banco de dados
    const response = await prismic.query<any>([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['post.title', 'post.content'], // Quais informações eu quero buscar
        pageSize: 100,                         // Quantos post serão trazidos
    }
    )


    const posts = response.results.map(post =>{
        return {
            slug: post.uid, // url de cada post
            title: RichText.asText(post.data.title), // A lib 'prismic-dom', por mieo do metodo RichText, consegue converter essas informações p texto 
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '', // procura um conteudo que seja do tipo paragrafo, se nao for, então ele retorna vazio
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }) // converte a ultima data de publicação
        }
    } )

    return { 
        props: {
            posts
        }
    }
}



