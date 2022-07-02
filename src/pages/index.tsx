import Head from "next/head";
import { GetStaticProps } from "next";
import { stripe } from "../services/stripe";

import { SubscribeButton } from "../components/subscribeButton";
import style from "./home.module.scss"

interface ProductProps{
  product: {
    priceId: string;
    amount: string;
  }
}

export default function Home({product} : ProductProps) {
  
  
  return (
    <>
      <Head> 
        <title> Ignews | Home </title>
      </Head>
      
      <main className={style.contentContainer}>
        <section className={style.hero}>
            <span>👏 Hey, welcome</span>
            <h1>News about the <span>React</span> world</h1>
            
            <p>
                Get acess to all the publications <br/>
                <span>for {product.amount} month</span>

            </p>
            <SubscribeButton/>
        
        </section>        
        <img src="/images/avatar.svg" alt="Girl coding" />

      </main>
   
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  // o link de retrive está em https://dashboard.stripe.com/test/products/prod_LCL9HfaJY6vFdr
  
  /* 
    Se vc quiser mais informações use o expand
    const price = await stripe.prices.retrieve('price_1KVwTcAzYyXLHPXu79fplzem', {
     expand: ['product']
  }); 
  
  */

  //
  const price = await stripe.prices.retrieve('price_1KVwTcAzYyXLHPXu79fplzem');

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount/100)
  }

  return { 
    props: {
      product
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}