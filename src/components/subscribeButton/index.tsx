import style from "./styles.module.scss"
import {useSession, signIn} from 'next-auth/react';
import {api} from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import { useRouter } from 'next/router';

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({priceId} : SubscribeButtonProps){
    const { data: session } = useSession();
    const router = useRouter();

    async function handleSubscribe(){
        if(!session){
            signIn('github');
            return;
        }


        if(session.activeSubscription){
            router.push('/posts');
            return;
        }

        try{ 
            const response = await api.post('/subscribe'); // nome do arquivo que faz o checkout

            const { sessionId } = response.data; // Propriedade retornada de dentro do arquivo que faz o checkout 

            const stripe = await getStripeJs();
            await stripe.redirectToCheckout( {sessionId} )
        }catch(err){
            alert(err.message)
            
        }

    }

    return (
        <button 
            type="button"
            className={style.subscribeButton}
            onClick={handleSubscribe}
>

            Subscribe now
        </button>

    )

}