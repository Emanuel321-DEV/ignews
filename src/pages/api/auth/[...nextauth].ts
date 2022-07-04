import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { fauna } from "../../../services/faunadb"
import { query as q } from "faunadb";


export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        // Info que eu vou querer do usuario
        params: {
          scope: "read:user",
        }
      },
    }),
  ],
  callbacks: {// Funcoes q sao executadas automaticamente assim que alguma ação é feita. Quando o user faz login por exemplo
    async session({ session }){
      
      try { 
        const userHasActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'), 
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'), 
                "active"
              )
            ])
          )
        )

        
  
        return {
          ...session,
          activeSubscription: userHasActiveSubscription
        };
      } catch (err) {
        
        return {
          ...session,
          activeSubscription: false
        }
      }
      
      
    },
    async signIn({ user }){

        const { email } = user;

        try{

          // inserção um usuario no banco          
          await fauna.query(
            q.If( // se
              q.Not( // nao
                q.Exists( // existe
                  q.Match(  // onde
                    q.Index("user_by_email"), // email de usuario
                    q.Casefold(email) // email 
                  )
                )
              ),
              // entao
              q.Create(
                q.Collection('users'),
                { data : { email }}
              ),
              // se existe 
              q.Get(
                q.Match(
                  q.Index("user_by_email"),// P buscar informações no fauna deve ser usado index
                  q.Casefold(email)
                )
              )
            ),
            
          )

          return true;
        
        }catch(err){
          return false;
        }

    }
  },
  secret: process.env.NEXTAUTH_SECRET
})