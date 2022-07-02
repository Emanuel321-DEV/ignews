import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import  Head  from 'next/head';
import style from './post.module.scss';

interface PostProps {
    post: {              
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    };
}

export default function Posts({ post }: PostProps) {
    
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
  
            <main className={style.container}>
                <article className={style.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div 
                    className={style.postContent}
                    dangerouslySetInnerHTML={ {__html: post.content } }/> {/* Por content ser um html, deve-se fazer essa conversão. Caso contrario o post será mostrado assim: <p>Texto </p>*/}

                </article>
            </main>
        
        </>

    )
}

export const getServerSideProps: GetServerSideProps = async ({req, params}) => {

        const session = await getSession({ req }); // Passando req, é verificado se o usuario está ou não logado
        const { slug } = params; // Temos aqui acesso ao slug do post que queremos carregar


        if(!session?.activeSubscription){
            return {
                redirect: {
                    destination: `/posts/preview/${slug}`,
                    permanent: false,
                }
            }
        }

        const prismic = getPrismicClient(req); // Buscando o ciente do prismic      
        

        const response = await prismic.getByUID<any>('uid', String(slug), {});
        

        const post = { 
            slug, 
            title: RichText.asText(response.data.title),
            content: RichText.asHtml(response.data.content),
            updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-br', { 
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }



        return {
            props: {
                post 
            }
        }


}