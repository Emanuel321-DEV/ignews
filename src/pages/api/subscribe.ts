// Nesse arquivo é feita a criação da checkout session do stripe (redirecionar pro meio de pagamento). Há muita comunicação tanto com fauna quanto com Stripe
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from '../../services/stripe';
import { fauna } from '../../services/faunadb';
import { query as q } from 'faunadb';

type User = {
    ref: {
        id: string;
    },
    data: {
        stripe_customer_id: string;
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res:NextApiResponse) => {


    if(req.method === 'POST'){

        // Buscando os dados da requisição
        const session = await getSession({ req });

        // Buscando um usuario no faunadb
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index("user_by_email"),
                    q.Casefold(session.user.email)
                )
            )
        )
        
        // Pegando o stripe_customer_id (Fica dentro do fauna) - isso se ele possuir um usuario no stripe -.
        let customerId = user.data.stripe_customer_id;
        
        // Caso contrário, criaremos um usuario pra ele no stripe e add a propriedade stripe_customer_id nesse usuario no fauna
        if(!customerId) {
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email
            })
            
            await fauna.query(
                q.Update(q.Ref(q.Collection("users"), user.ref.id), {
                  data: {
                    stripe_customer_id: stripeCustomer.id,
                  },
                })
              )

            customerId = stripeCustomer.id;
        }
        
        // Criando sessão de checkout
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId, // Id do usuario no fauna
            payment_method_types: ['card'], // Tipos de pagamento q serao aceitos
            billing_address_collection: 'required', // Obrigar o user a colocar um endereço
            line_items: [ // Items que a pessoa terá no carrinho
                { price: 'price_1KVwTcAzYyXLHPXu79fplzem', quantity: 1 } // link do price que está raiz do projeto em index, qtd de assinatura
            ],
            mode: 'subscription', // Pagamento recorrente
            allow_promotion_codes: true, // Cupons de desconto
            success_url: process.env.STRIPE_SUCCESS_URL, // Se der certo pra onde o usuario vai ser redirecionado
            cancel_url: process.env.STRIPE_CANCEL_URL, // Se der errado pra onde o usuario vai ser redirecionado
        })
            

        return res.status(200).json({ sessionId: stripeCheckoutSession.id })



    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}

