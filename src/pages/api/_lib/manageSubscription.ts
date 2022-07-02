// Tudo que está em _lib nao será considerado uma rota, por conta do _

import { fauna } from "../../../services/faunadb";

import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";


// Salva as informações de inscrição no banco de dados
export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
){
    try{
        const userRef = await fauna.query(
            q.Select("ref", q.Get( q.Match( q.Index("user_by_stripe_customer_id"), customerId)))
        )

    
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
        const subscriptionData = {
            id: subscription.id,
            userId: userRef,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id
        }

        if(createAction){
            await fauna.query(
                q.Create(
                    q.Collection('subscriptions'),
                    { data: subscriptionData }
                )
            )
    
        }
        else{ 
            await fauna.query(
                q.Replace( 
                    q.Select("ref", 
                        q.Get( 
                            q.Match( 
                                q.Index('subscription_by_id'), subscriptionId
                            )
                        )
                    ), { data: subscriptionData }
                )
            )

        }
    } catch(err){
        console.log("ERRO AO SALVAR INSCRIÇÃO NO BANCO DE DADOS")
    }

    

}