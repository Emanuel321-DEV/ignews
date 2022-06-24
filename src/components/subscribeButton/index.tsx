// Nesse arquivo é iniciada a logica de sessão de checkout do usuario, isto é, ele ser redirecionado pra uma url de meio de pagamentos ao clicar no subscribeButton. 

// Assim, é necessário se conectar com o Stripe, para isso, usaremos as api routes do next, pois assim o cliente nao tem acesso a váriavel de ambiente secreta do Stripe

// Um arquivo subscribe.ts foi criado


import style from "./styles.module.scss"
import {useSession, signIn} from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId } : SubscribeButtonProps){
    // Verifica se o user está logado
    const { data: session } = useSession();

    async function handleSubscribe(){
        // Se o usuario n estiver logado
        if(!session){
            // redireciona pro login com github
            signIn('github');
            return;
        }

        try{ 

            const response = await api.post('/subscribe'); // nome do arquivo que faz o checkout. Lembre-se dos conceitos de rota no next... 

            const { sessionId } = response.data; // Propriedade retornada de dentro do arquivo que faz o checkout 

            // Integração do stripe com browser
            const stripe = await getStripeJs();

            // redireciona o user para o checkout 
            await stripe.redirectToCheckout( { sessionId } )

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