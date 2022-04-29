import { NextApiRequest, NextApiResponse } from 'next';

import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from './_lib/manageSubscription';

async function buffer (readable: Readable){
    const chunks = [];

    for await (const chunk of readable){
        chunks.push( 
            typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks);
}


// Next por padrão pensa que as requisições receberão informações no formato JSON. Porém, como nesse caso estamos recebendo informações no formato Stream, então precisamos desativar o entendimento padrão do Next
export const config = { 
    api:{
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
])

const webhooks = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {
        const buf = await buffer(req);
        const secret = req.headers['stripe-signature']
        
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
        }catch(err){
            return res.status(400).send(`Webhook error: ${err.message}`)
        }
        
        const { type } = event;

        if(relevantEvents.has(type)){
            try {
            // Como futuramente ouviremos varios tipos de eventos podemos fazer uso da estrutura switch
                switch (type) {
                    case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':
                        const subscription = event.data.object as Stripe.Subscription

                        await saveSubscription(
                           subscription.id, 
                           subscription.customer.toString(), 
                           type === 'customer.subscription.created',
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
                        break;
                }
            }catch(err){
                return res.json({error: 'Webhook handler failed.'})
            }

        }

        res.json({ received: true})
    }

    else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }
    
}


export default webhooks;