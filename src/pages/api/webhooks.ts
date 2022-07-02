// Webhooks são formas de ouvirmos eventos. Pagamento bem sucedido, mal sucedido etc... Isso eh util pra tratarmos alguns erros 

// Quando a aplicação estiver em produção é necessário colocar um endpoint: Aula Webhooks do Stripe. Quando estiver em desenvolvimento teremos que utilizar a cli do stripe
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import  Stripe  from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

// Função que faz as tratativas necessárias nos eventos webhooks
async function buffer(readable: Readable){
    const chunks = [];

    for await (const chunk of readable){
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk): chunk
        );
    }


    return Buffer.concat(chunks)

}

// Por padrao para o next toda req vem como json, mas nesse caso nao virá. Virá como readble (Algo que é lido aos poucos ) 
export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted'
])


// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {

    if(req.method === 'POST'){
        const buf = await buffer( req );
        
        // O stripe eh uma rota, assim, para evitar que outra pessoa tenha acesso a ela usamos um secret disponibilizado pelo proprio stripe
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
        } catch(err){
            
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        const { type } = event;

        if(relevantEvents.has(type)){
            try{ 
                switch(type){
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':

                    const subscription = event.data.object as Stripe.Subscription

                    await saveSubscription(
                        subscription.id,
                        subscription.customer.toString(),
                        false
                    )

                    break;

                case 'checkout.session.completed':
                
                const checkoutSession = event.data.object as Stripe.Checkout.Session

                await saveSubscription(
                    checkoutSession.subscription.toString(),
                    checkoutSession.customer.toString(),
                    true
                )

                break;
                
                default: 
                    throw new Error('Unhandled event')
                }
            } catch(err){
                return res.json({error: 'Webhook handler failed'})
            }
        }

        res.status(200).json({ok: true})

    }else {
        res.setHeader('Allow', 'POST')
        res.status(405).end("Method not allowed")
    }



}